'use client';
import { Button } from '@/app/components/ui/button';
import CustomPagination from '@/app/components/ui/pagination';
import {
  cleanOldEntries,
  getImageFromDB,
  getMetadataFromDB,
  setImageInDB,
  setMetadataInDB,
} from '@/lib/indexedDB';
import { axiosInterceptorInstance } from '@/lib/interceptor';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { redirect, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const enum Quality {
  HIGH = 'high',
  LOW = 'low',
}

export default function GetMangaPage() {
  const { id, chapterId, chapterPage } = useParams();
  const [image, setImage] = useState<string>('');
  const [nextImage, setNextImage] = useState<string>('');
  const [previousImage, setPreviousImage] = useState<string>('');
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState(Number(chapterPage));
  const [quality, setQuality] = useState(Quality.HIGH);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const buildUrl = (chapterId: string, quality: string): string => {
    return `/manga/chapter/${chapterId}/${chapterPage}?quality=${quality}`;
  };

  const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
    const proxyUrl = `${process.env.NEXT_PUBLIC_API_URL}/proxy/image?url=${encodeURIComponent(imageUrl)}`;
    const response = await axios.get(proxyUrl, { responseType: 'arraybuffer' });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  };

  const fetchChapters = async () => {
    try {
      const imageKey = `chapter-${chapterId}-page-${chapterPage}-${quality}`;
      const totalKey = `chapter-${chapterId}-total`;
      const cachedImage = await getImageFromDB(imageKey);
      const cachedTotal = await getMetadataFromDB(totalKey);

      if (cachedImage && cachedTotal) {
        setImage(cachedImage);
        setTotal(Number(cachedTotal));
      } else {
        const response = await axiosInterceptorInstance.get(buildUrl(chapterId as string, quality));
        const base64Image = await convertImageToBase64(response.data.url);
        await setImageInDB(imageKey, base64Image);
        await setMetadataInDB(totalKey, response.data.numberOfPages);
        setImage(base64Image);
        setTotal(response.data.numberOfPages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNextAndPreviousChapters = async () => {
    try {
      const nextPageKey = `chapter-${chapterId}-page-${parseInt(chapterPage as string) + 1}-${quality}`;
      const previousPageKey = `chapter-${chapterId}-page-${parseInt(chapterPage as string) - 1}-${quality}`;

      const cachedNextImage = await getImageFromDB(nextPageKey);
      const cachedPreviousImage = await getImageFromDB(previousPageKey);

      if (!cachedNextImage) {
        const nextResponse = await axiosInterceptorInstance.get(
          buildUrl(chapterId as string, quality)
        );
        const nextBase64Image = await convertImageToBase64(nextResponse.data.url);
        await setImageInDB(nextPageKey, nextBase64Image);
        setNextImage(nextBase64Image);
      } else {
        setNextImage(cachedNextImage);
      }

      if (!cachedPreviousImage) {
        const previousResponse = await axiosInterceptorInstance.get(
          buildUrl(chapterId as string, quality)
        );
        const previousBase64Image = await convertImageToBase64(previousResponse.data.url);
        await setImageInDB(previousPageKey, previousBase64Image);
        setPreviousImage(previousBase64Image);
      } else {
        setPreviousImage(cachedPreviousImage);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (page !== Number(chapterPage))
      redirect(`/${id as string}/chapter/${chapterId as string}/${page}`);
  }, [page, chapterId, chapterPage, id]);

  useEffect(() => {
    setImage('');
    fetchChapters();
    fetchNextAndPreviousChapters();
  }, [quality, chapterPage, chapterId]);

  useEffect(() => {
    cleanOldEntries();
  }, []);

  // Add keyboard navigation for better user experience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Left arrow or 'A' key for previous page
      if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && Number(chapterPage) > 1) {
        window.location.href = `/${id as string}/chapter/${chapterId as string}/${parseInt(chapterPage as string) - 1}`;
      }
      // Right arrow or 'D' key for next page
      else if (
        (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') &&
        Number(chapterPage) < Number(total)
      ) {
        window.location.href = `/${id as string}/chapter/${chapterId as string}/${parseInt(chapterPage as string) + 1}`;
      }
      // 'H' key to toggle quality
      else if (e.key === 'h' || e.key === 'H') {
        setQuality(prevQuality => (prevQuality === Quality.HIGH ? Quality.LOW : Quality.HIGH));
      }
      // 'Home' key to go to first page
      else if (e.key === 'Home' && Number(chapterPage) > 1) {
        window.location.href = `/${id as string}/chapter/${chapterId as string}/1`;
      }
      // 'End' key to go to last page
      else if (e.key === 'End' && Number(chapterPage) < Number(total)) {
        window.location.href = `/${id as string}/chapter/${chapterId as string}/${total}`;
      }
      // 'Escape' key to go back to manga page
      else if (e.key === 'Escape') {
        window.location.href = `/${id as string}`;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [id, chapterId, chapterPage, total]);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm h-14">
        <div className="container mx-auto px-4 h-full flex justify-between items-center">
          <Link
            href={`/${id as string}`}
            className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors"
          >
            <Button variant="ghost" size="sm" className="flex items-center gap-1 font-medium">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-left"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Back to Chapter List
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-white/80">
              Page {chapterPage} of {total}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                quality === Quality.HIGH ? setQuality(Quality.LOW) : setQuality(Quality.HIGH)
              }
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Quality: {quality === Quality.HIGH ? 'High' : 'Low'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShortcuts(true)}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Shortcuts
            </Button>
          </div>
        </div>
      </header>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 w-80 rounded-lg shadow-lg p-4 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setShowShortcuts(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-white mb-3">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Next page</span>
                <span className="text-gray-400">→ or D</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Previous page</span>
                <span className="text-gray-400">← or A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Toggle quality</span>
                <span className="text-gray-400">H</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">First page</span>
                <span className="text-gray-400">Home</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Last page</span>
                <span className="text-gray-400">End</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Back to manga</span>
                <span className="text-gray-400">Esc</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reading Area */}
      <main className="flex-1 flex flex-col items-center justify-center pt-16 pb-16 relative cursor-pointer">
        {/* Navigation Overlays */}
        {Number(chapterPage) > 1 && (
          <Link
            href={`/${id as string}/chapter/${chapterId as string}/${parseInt(chapterPage as string) - 1}`}
            className="fixed top-1/2 left-0 z-10 h-32 -translate-y-1/2 cursor-pointer group flex items-center"
          >
            <div className="opacity-0 group-hover:opacity-60 transition-all duration-200 bg-gradient-to-r from-gray-900 to-transparent absolute left-0 top-0 bottom-0 w-32">
              <div className="absolute left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-2">
                <div className="bg-gray-800/70 p-3 rounded-full shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        )}

        {Number(chapterPage) < Number(total) && (
          <Link
            href={`/${id as string}/chapter/${chapterId as string}/${parseInt(chapterPage as string) + 1}`}
            className="fixed top-1/2 right-0 z-10 h-32 -translate-y-1/2 cursor-pointer group flex items-center justify-end"
          >
            <div className="opacity-0 group-hover:opacity-60 transition-all duration-200 bg-gradient-to-l from-gray-900 to-transparent absolute right-0 top-0 bottom-0 w-32">
              <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:-translate-x-2">
                <div className="bg-gray-800/70 p-3 rounded-full shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Manga Image */}
        <div
          className="max-w-4xl w-full mx-auto px-4 transition-opacity duration-300"
          style={{ opacity: image ? 1 : 0 }}
        >
          {image && (
            <div className="relative shadow-2xl">
              {Number(chapterPage) > 1 && (
                <div
                  className="absolute left-0 top-0 h-full w-1/2 cursor-pointer z-10"
                  onClick={() => {
                    window.location.href = `/${id as string}/chapter/${chapterId as string}/${parseInt(chapterPage as string) - 1}`;
                  }}
                />
              )}

              {Number(chapterPage) < Number(total) && (
                <div
                  className="absolute right-0 top-0 h-full w-1/2 cursor-pointer z-10"
                  onClick={() => {
                    window.location.href = `/${id as string}/chapter/${chapterId as string}/${parseInt(chapterPage as string) + 1}`;
                  }}
                />
              )}

              <Image
                src={image}
                alt={`Chapter page ${chapterPage}`}
                width={1080}
                height={0}
                className="h-auto w-full object-contain"
                priority={true}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
              />
            </div>
          )}
          {!image && (
            <div className="h-[80vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/90 to-transparent h-14">
        <div className="absolute inset-0 backdrop-blur-md"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-md flex items-center pb-8">
            <CustomPagination page={page} setPage={setPage} totalPages={total} />
          </div>
        </div>
      </footer>
    </div>
  );
}
