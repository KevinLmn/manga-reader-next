'use client';
import { Button } from '@/app/components/ui/button';
import CustomPagination from '@/app/components/ui/pagination';
import { cleanOldEntries } from '@/lib/indexedDB';
import { useChapterTotalPages, useCurrentPageImage, usePrefetchAdjacentPages } from '@/lib/queries';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const enum Quality {
  HIGH = 'high',
  LOW = 'low',
}

export default function GetMangaPage() {
  const { id, chapterId, chapterPage } = useParams();
  const page = Number(chapterPage);
  const [quality, setQuality] = useState(Quality.HIGH);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const safeChapterId = typeof chapterId === 'string' ? chapterId : '';
  const { data: image, isLoading } = useCurrentPageImage(safeChapterId, page, quality);
  const { data: total } = useChapterTotalPages(safeChapterId);

  usePrefetchAdjacentPages(safeChapterId, page, quality);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const base = `/${id}/chapter/${chapterId}`;
      if ((e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') && page > 1)
        window.location.href = `${base}/${page - 1}`;
      else if ((e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') && page < Number(total))
        window.location.href = `${base}/${page + 1}`;
      else if (e.key.toLowerCase() === 'h')
        setQuality(q => (q === Quality.HIGH ? Quality.LOW : Quality.HIGH));
      else if (e.key === 'Home' && page > 1) window.location.href = `${base}/1`;
      else if (e.key === 'End' && page < Number(total)) window.location.href = `${base}/${total}`;
      else if (e.key === 'Escape') window.location.href = `/${id}`;
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [id, chapterId, page, total]);

  console.log(image, isLoading);

  useEffect(() => {
    cleanOldEntries();
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm h-14">
        <div className="container mx-auto px-4 h-full flex justify-between items-center">
          <Link
            href={`/${id}`}
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
              Page {page} of {total}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuality(q => (q === Quality.HIGH ? Quality.LOW : Quality.HIGH))}
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
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-white mb-3">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm">
              {[
                ['Next page', '→ or D'],
                ['Previous page', '← or A'],
                ['Toggle quality', 'H'],
                ['First page', 'Home'],
                ['Last page', 'End'],
                ['Back to manga', 'Esc'],
              ].map(([action, key]) => (
                <div key={action} className="flex justify-between">
                  <span className="text-gray-300">{action}</span>
                  <span className="text-gray-400">{key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manga Image with Link overlays */}
      <main className="flex-1 flex flex-col items-center justify-center pt-16 pb-16 relative cursor-pointer">
        <div
          className="max-w-4xl w-full mx-auto px-4 transition-opacity duration-300"
          style={{ opacity: image ? 1 : 0 }}
        >
          {image ? (
            <div className="relative shadow-2xl">
              {page > 1 && (
                <Link
                  href={`/${id}/chapter/${chapterId}/${page - 1}`}
                  className="absolute left-0 top-0 h-full w-1/2 z-10"
                >
                  <span className="block h-full w-full" />
                </Link>
              )}
              {page < Number(total) && (
                <Link
                  href={`/${id}/chapter/${chapterId}/${page + 1}`}
                  className="absolute right-0 top-0 h-full w-1/2 z-10"
                >
                  <span className="block h-full w-full" />
                </Link>
              )}
              <Image
                src={image}
                alt={`Chapter page ${page}`}
                width={1080}
                height={0}
                className="h-auto w-full object-contain"
                priority
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
              />
            </div>
          ) : (
            <div className="h-[80vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white" />
            </div>
          )}
        </div>
      </main>

      {/* Bottom Pagination */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/90 to-transparent h-14">
        <div className="absolute inset-0 backdrop-blur-md" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-md flex items-center pb-8">
            <CustomPagination
              mangaId={id as string}
              chapterId={chapterId as string}
              totalPages={Number.isFinite(total) ? total : 1}
              page={page}
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
