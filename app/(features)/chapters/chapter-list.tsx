/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/xKKUiu6JBfU
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

/** Add fonts into your Next.js project:

import { Inter } from 'next/font/google'

inter({
  subsets: ['latin'],
  display: 'swap',
})

To read more about using these font, please visit the Next.js documentation:
- App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
**/
'use client';
import { Download } from 'lucide-react';
import Link from 'next/link';
import CustomPagination from './Pagination/pagination';

const LIMIT = 24;

interface Chapter {
  id: string;
  attributes: {
    chapter: string;
    title: string;
    volume: string;
    pages: number;
    publishAt: string;
    id: string;
  };
}

interface ChaptersToDownload {
  from: string | number;
  to: string | number;
}

interface ChapterListProps {
  chapters: Chapter[];
  page: number;
  setPage: (page: number) => void;
  total: number;
  mangaId: string;
  downloadChapter: (chapter: string) => void;
  setChapter: (chapters: Chapter[]) => void;
}

export function ChapterList({
  chapters,
  page,
  setPage,
  total,
  mangaId,
  downloadChapter,
  setChapter,
}: ChapterListProps) {
  const totalPages = Math.ceil(total / LIMIT);
  let numberOfChapters = 0;
  while (chapters[numberOfChapters]?.attributes.chapter) {
    numberOfChapters++;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Manga Chapters</h1>
        <p className="text-gray-500 dark:text-gray-400">Browse through the latest chapters.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {chapters &&
          chapters.map((chapter: Chapter) => {
            return (
              <div
                key={chapter.id}
                className="bg-white rounded-lg shadow-md dark:bg-gray-800 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <Link href={`/${mangaId}/chapter/${chapter.id}/1`} className="block p-4 min-w-14">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Chapter {chapter.attributes.chapter}
                    </span>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {chapter.attributes.pages} pages
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{chapter.attributes.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Volume {chapter.attributes.volume}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(chapter.attributes.publishAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <button
                    className="w-full py-3 px-4 bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center gap-2 group"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      downloadChapter(chapter.id);
                    }}
                  >
                    <Download className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>Download Chapter</span>
                  </button>
                </div>
              </div>
            );
          })}
      </div>
      <CustomPagination page={page} setPage={setPage} totalPages={totalPages} />
    </div>
  );
}
