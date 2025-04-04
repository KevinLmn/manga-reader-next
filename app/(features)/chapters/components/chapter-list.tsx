'use client';

import { Button } from '@/app/components/ui/button';
import CustomPagination from '@/app/components/ui/pagination';
import { LIMIT } from '@/lib/constants';
import { axiosInterceptorInstance } from '@/lib/interceptor';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
}

interface Window {
  showSaveFilePicker(options: {
    suggestedName: string;
    types: Array<{
      description: string;
      accept: Record<string, string[]>;
    }>;
  }): Promise<FileSystemFileHandle>;
}

interface Chapter {
  id: string;
  attributes: {
    chapter: string;
    title: string;
    pages: number;
    volume: string;
    publishAt: string;
  };
}

interface ChapterListProps {
  chapters: Chapter[];
  page: number;
  setPage: (page: number) => void;
  total: number;
  mangaId: string;
}

export function ChapterList({ chapters, page, setPage, total, mangaId }: ChapterListProps) {
  const totalPages = Math.ceil(total / LIMIT);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const downloadChapter = async (chapterId: string, chapterNumber: string) => {
    const toastId = `download-${chapterId}`;
    try {
      setIsDownloading(chapterId);
      toast.loading('Starting download...', { id: toastId });

      const response = await axiosInterceptorInstance.get(
        `/manga/${mangaId}/download/${chapterId}`,
        {
          responseType: 'arraybuffer',
          timeout: 300000, // 5 minutes timeout
          withCredentials: true,
          headers: {
            Accept: 'image/png, application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          validateStatus: function (status) {
            return status >= 200 && status < 500; // Accept all responses to handle errors properly
          },
          onDownloadProgress: progressEvent => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 'Processing';
            toast.loading(`Downloading: ${progress}%`, { id: toastId });
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      if (!response.data) {
        throw new Error('No data received from server');
      }

      toast.loading('Processing download...', { id: toastId });

      // Convert arraybuffer to blob
      const blob = new Blob([response.data], { type: 'image/png' });

      // Use the traditional download method which is more reliable
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Chapter_${chapterNumber}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Chapter ${chapterNumber} downloaded successfully`, { id: toastId });
    } catch (error: any) {
      console.error('Download error:', error);
      let errorMessage = 'Unknown error occurred';

      try {
        if (error.response?.data instanceof ArrayBuffer) {
          const text = new TextDecoder().decode(error.response.data);
          try {
            const parsed = JSON.parse(text);
            errorMessage = parsed.error || parsed.message || text;
          } catch {
            errorMessage = text;
          }
        } else {
          errorMessage = error.response?.data?.error || error.message;
        }
      } catch (parseError) {
        console.error('Error parsing error message:', parseError);
        errorMessage = error.message || 'Failed to download chapter';
      }

      toast.error(`Download failed: ${errorMessage}`, { id: toastId });
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Chapters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {chapters?.map(chapter => (
          <div
            key={chapter.id}
            className="group relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 transition-all rounded-lg overflow-hidden border border-gray-700 min-h-[180px] shadow-lg hover:shadow-xl"
          >
            <Link href={`/${mangaId}/chapter/${chapter.id}/1`} className="block p-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-semibold">Ch. {chapter.attributes.chapter}</span>
                  <span className="text-sm text-muted-foreground">
                    {chapter.attributes.pages} pages
                  </span>
                </div>

                {chapter.attributes.title && (
                  <h3 className="text-base font-medium text-foreground/90">
                    {chapter.attributes.title}
                  </h3>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-2">
                  <span>Volume {chapter.attributes.volume || 'N/A'}</span>
                  <span>{new Date(chapter.attributes.publishAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              disabled={isDownloading === chapter.id}
              onClick={e => {
                e.preventDefault();
                downloadChapter(chapter.id, chapter.attributes.chapter);
              }}
              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isDownloading === chapter.id ? 'Downloading...' : 'Download'}
            </Button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <CustomPagination page={page} setPage={setPage} totalPages={totalPages} />
      </div>
    </div>
  );
}
