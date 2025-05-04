import { FastifyReply, FastifyRequest } from "fastify";
import { ImageService } from "../services/imageService.js";
import { MangaDexService } from "../services/mangaDexService.js";

type DownloadChapterRequestBody = {
  chapterId: string;
};

type DownloadMangaIdParams = {
  id: string;
};

export const downloadChaptersController = async (
  request: FastifyRequest<{
    Params: {
      id: string;
      chapterId: string;
    };
  }>,
  reply: FastifyReply
) => {
  try {
    const { id, chapterId } = request.params;

    // Use backend's stored credentials instead of requiring user token
    const mangaDexService = new MangaDexService();
    const imageService = new ImageService();

    // Get chapter download links
    console.log("Fetching chapter download links...");
    const links = await mangaDexService.getChapterDownloadLinks(chapterId);
    console.log(`Got ${links.length} download links`);

    // Set response headers
    reply.raw.writeHead(200, {
      "Access-Control-Allow-Origin": `${process.env.NEXT_PUBLIC_FRONT_END_URL}`,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Accept, X-Requested-With, Authorization",
      "Access-Control-Expose-Headers":
        "Content-Disposition, Content-Type, Content-Length",
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="chapter-${chapterId}.png"`,
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Transfer-Encoding": "chunked",
    });

    // Set up streaming response with appropriate headers
    // Stream the assembled image directly to the client
    await imageService.assembleImagesAndStream(links, reply.raw);

    return reply;
  } catch (error) {
    console.error("Error in downloadChaptersController:", error);
    if (!reply.sent) {
      const statusCode =
        error instanceof Error && "status" in error
          ? (error as any).status
          : 500;
      const message =
        error instanceof Error ? error.message : "Internal server error";

      return reply.status(statusCode).send({
        error: statusCode === 500 ? "Internal server error" : message,
        message: statusCode === 500 ? message : undefined,
      });
    }
  }
};
