import axios from "axios";
import os from "os";
import sharp from "sharp";
import { Writable } from "stream";
import { ApiError } from "../utils.js";

/**
 * Service for handling manga image processing and streaming
 * Handles downloading, resizing, and assembling images into a single stream
 */
export class ImageService {
  // Configuration constants
  private static readonly WANTED_WIDTH = 1080;
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000;
  private static readonly CONCURRENT_DOWNLOADS = Math.max(
    2,
    Math.min(os.cpus().length - 1, 6)
  ); // Limit concurrency based on CPU cores

  /**
   * Download a single image with retry logic
   * @param url - URL of the image to download
   * @param index - Index of the image in the batch (for logging)
   * @param total - Total number of images (for logging)
   * @returns Buffer containing the downloaded image
   * @throws ApiError if download fails after all retries
   */
  private async downloadSingleImage(
    url: string,
    index: number,
    total: number
  ): Promise<Buffer> {
    let retries = 0;

    while (retries < ImageService.MAX_RETRIES) {
      try {
        console.log(`Downloading image ${index + 1}/${total}...`);
        const response = await axios.get(url, {
          responseType: "arraybuffer",
          timeout: 15000, // 15 second timeout
          headers: {
            Accept: "image/jpeg, image/png, image/webp, image/*",
            "User-Agent": "MangaDB/1.0",
          },
        });

        const buffer = Buffer.from(response.data, "binary");

        if (buffer.length === 0) {
          throw new Error("Empty response received");
        }

        console.log(
          `Successfully downloaded image ${index + 1}/${total} (${(
            buffer.length / 1024
          ).toFixed(1)} KB)`
        );
        return buffer;
      } catch (error) {
        retries++;
        console.log(
          `Retry ${retries}/${ImageService.MAX_RETRIES} for image ${
            index + 1
          }/${total}...`
        );

        if (retries >= ImageService.MAX_RETRIES) {
          if (axios.isAxiosError(error)) {
            throw new ApiError(
              `Failed to download image ${index + 1}/${total}: ${
                error.message
              }`,
              error.response?.status || 500,
              error.response?.data
            );
          }
          throw new ApiError(
            `Failed to download image ${index + 1}/${total}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }

        // Exponential backoff
        const delay = ImageService.RETRY_DELAY * Math.pow(2, retries - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // This should never be reached due to the throw above, but TypeScript needs it
    throw new ApiError(`Failed to download image ${index + 1}/${total}`, 500);
  }

  /**
   * Download multiple images with controlled concurrency
   * @param urls - Array of image URLs to download
   * @returns Promise resolving to array of image buffers
   */
  async downloadImages(urls: string[]): Promise<Buffer[]> {
    console.log(
      `Starting download of ${urls.length} images with ${ImageService.CONCURRENT_DOWNLOADS} concurrent downloads...`
    );

    // Prepare the result array with the correct length
    const results: Buffer[] = new Array(urls.length);
    let completed = 0;

    // Process images in batches to control concurrency
    for (let i = 0; i < urls.length; i += ImageService.CONCURRENT_DOWNLOADS) {
      const batch = urls.slice(i, i + ImageService.CONCURRENT_DOWNLOADS);
      const batchIndexes = Array.from(
        { length: batch.length },
        (_, idx) => i + idx
      );

      try {
        // Download batch concurrently
        const batchResults = await Promise.all(
          batch.map((url, idx) =>
            this.downloadSingleImage(url, batchIndexes[idx]!, urls.length)
          )
        );

        // Store results in the correct position
        batchIndexes.forEach((originalIndex, idx) => {
          results[originalIndex] = batchResults[idx]!;
        });

        completed += batch.length;
        console.log(`Completed ${completed}/${urls.length} downloads`);
      } catch (error) {
        console.error("Error in download batch:", error);
        throw error;
      }
    }

    console.log("All images downloaded successfully");
    return results;
  }

  /**
   * Resize and assemble multiple images into a vertical strip
   * @param imageBuffers - Array of image buffers to process
   * @returns Promise resolving to the processed image buffer
   */
  private async processImages(imageBuffers: Buffer[]): Promise<Buffer> {
    console.log("Processing and assembling images...");

    try {
      // Process image metadata and resize images
      const images = await Promise.all(
        imageBuffers.map(async (buffer: Buffer, index: number) => {
          if (!buffer || buffer.length === 0) {
            throw new ApiError(
              `Image buffer ${index} is empty or invalid`,
              500
            );
          }

          try {
            const metadata = await sharp(buffer).metadata();
            const { width, height } = metadata;

            if (!width || !height) {
              throw new ApiError(
                `Could not determine dimensions for image ${index}`,
                500
              );
            }

            const scaleFactor = ImageService.WANTED_WIDTH / width;
            const scaledHeight = Math.round(height * scaleFactor);

            // Pre-resize the image to save memory during composition
            const resizedBuffer = await sharp(buffer)
              .resize(ImageService.WANTED_WIDTH, scaledHeight, {
                fit: "fill",
                withoutEnlargement: false,
              })
              .toBuffer();

            return {
              buffer: resizedBuffer,
              width: ImageService.WANTED_WIDTH,
              height: scaledHeight,
            };
          } catch (error) {
            throw new ApiError(
              `Failed to process image ${index}: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
              500
            );
          }
        })
      );

      // Calculate total height
      const totalHeight = images.reduce((sum, img) => sum + img.height, 0);
      console.log(
        `Creating final image (${ImageService.WANTED_WIDTH}x${totalHeight})...`
      );

      // Prepare composite operations
      let yOffset = 0;
      const compositeList = images.map((img) => {
        const position = { input: img.buffer, top: yOffset, left: 0 };
        yOffset += img.height;
        return position;
      });

      // Generate the final image
      return await sharp({
        create: {
          width: ImageService.WANTED_WIDTH,
          height: totalHeight,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        },
      })
        .composite(compositeList)
        .png({ compressionLevel: 6 }) // Balance between size and speed
        .toBuffer();
    } catch (error) {
      console.error("Image processing error:", error);
      throw new ApiError(
        `Failed to process images: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  }

  /**
   * Download, assemble, and stream images to the client
   * @param urls - Array of image URLs to process
   * @param writeStream - Writable stream to send the final image
   * @returns Promise that resolves when streaming is complete
   */
  async assembleImagesAndStream(
    urls: string[],
    writeStream: Writable
  ): Promise<void> {
    console.log(`Starting processing of ${urls.length} images...`);

    try {
      // Step 1: Download all images
      const imageBuffers = await this.downloadImages(urls);

      // Step 2: Process and assemble images
      const finalImageBuffer = await this.processImages(imageBuffers);

      // Step 3: Stream the result to the client
      console.log(
        `Streaming final image (${(
          finalImageBuffer.length /
          1024 /
          1024
        ).toFixed(2)} MB)...`
      );

      // Return a promise that resolves when the stream is finished
      return new Promise((resolve, reject) => {
        writeStream.write(finalImageBuffer, (err) => {
          if (err) {
            console.error("Write stream error:", err);
            reject(
              new ApiError(`Failed to write to stream: ${err.message}`, 500)
            );
            return;
          }

          writeStream.end(() => {
            console.log("Stream finished successfully");
            resolve();
          });
        });
      });
    } catch (error) {
      console.error("Assembly/streaming error:", error);
      throw new ApiError(
        `Failed to process and stream images: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  }
}
