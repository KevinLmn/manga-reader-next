'use client';

import { getProxiedImageUrl } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function ChapterReader({ params }: { params: { id: string; chapterId: string } }) {
  const [chapterPages, setChapterPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChapterPages = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/manga/chapter/${params.chapterId}/1`
        );
        const data = await response.json();
        const pages = data.pages.map((page: string) => getProxiedImageUrl(page));
        setChapterPages(pages);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching chapter pages:', error);
        setIsLoading(false);
      }
    };

    fetchChapterPages();
  }, [params.chapterId]);

  const handleNextPage = () => {
    if (currentPage < chapterPages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative w-full h-screen bg-black">
      <div className="absolute inset-0 flex items-center justify-center">
        {chapterPages[currentPage] && (
          <Image
            src={chapterPages[currentPage]}
            alt={`Page ${currentPage + 1}`}
            width={800}
            height={1200}
            className="max-w-full max-h-full object-contain"
            priority
          />
        )}
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
          className="px-4 py-2 bg-white/20 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-white">
          Page {currentPage + 1} of {chapterPages.length}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === chapterPages.length - 1}
          className="px-4 py-2 bg-white/20 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
