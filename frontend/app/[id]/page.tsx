'use client';
import { ChapterList } from '@/app/(features)/chapters/chapter-list';
import { Card } from '@/app/components/ui/card';
import api from '@/lib/interceptor';
import { useMangaDetails, usePrefetchFirstPage } from '@/lib/queries';
import { getProxiedImageUrl } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Chapter {
  id: string;
  attributes: {
    chapter: string;
    title: string;
    volume: string;
    pages: number;
    publishAt: string;
  };
}

interface Manga {
  id: string;
  attributes?: {
    title: { en: string };
    description: { en: string };
    tags: Array<{
      attributes: {
        name: { en: string };
      };
    }>;
  };
  relationships: Array<{
    type: string;
    attributes: {
      fileName: string;
    };
  }>;
}

export default function GetMangaById() {
  const [page, setPage] = useState<number>(1);
  const [coverImage, setCoverImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { id } = useParams();

  const { data, isLoading: isDataLoading } = useMangaDetails(id as string, page);
  const prefetchFirstPage = usePrefetchFirstPage();

  const downloadChapter = async (chapterId: string) => {
    try {
      toast.info('Starting download...');
      const response = await api.get(`/manga/${id}/download/${chapterId}`, {
        responseType: 'blob',
        timeout: 10 * 60 * 1000,
      });

      const chapter = data?.chapters.data.find((c: Chapter) => c.id === chapterId);
      if (!chapter) {
        throw new Error('Chapter not found');
      }

      const blob = new Blob([response.data], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${data?.manga.data.attributes?.title?.en || 'manga'}_chapter_${chapter.attributes.chapter}.png`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Download completed!');
    } catch (err) {
      toast.error('Failed to download chapter. Please try again.');
    }
  };

  useEffect(() => {
    const fetchCoverImage = async () => {
      if (data?.manga.data.id && data?.manga.data.relationships?.length > 0) {
        setIsLoading(true);
        try {
          const coverArt = data.manga.data.relationships.find(
            (el: { type: string }) => el.type === 'cover_art'
          );
          if (coverArt) {
            const coverUrl = `https://uploads.mangadex.org/covers/${data.manga.data.id}/${coverArt.attributes.fileName}.512.jpg`;
            const base64Image = await getProxiedImageUrl(coverUrl);
            if (base64Image) {
              setCoverImage(base64Image);
            }
          }
        } catch (error) {
          toast.error('Failed to load cover image');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCoverImage();
  }, [data?.manga.data]);

  if (isDataLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <Card className="p-6">
          {isLoading ? (
            <div className="aspect-[2/3] w-full animate-pulse rounded-lg bg-gray-200" />
          ) : (
            <Image
              src={coverImage}
              alt={data?.manga.data.attributes?.title?.en || 'Manga Cover'}
              width={300}
              height={450}
              className="aspect-[2/3] w-full rounded-lg object-cover"
            />
          )}
          <div className="mt-4">
            <h1 className="text-2xl font-bold">{data?.manga.data.attributes?.title?.en}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {data?.manga.data.attributes?.description?.en}
            </p>
          </div>
        </Card>
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Chapters</h2>
          </div>
          <ChapterList
            chapters={data?.chapters.data || []}
            page={page}
            setPage={setPage}
            total={data?.chapters.total || 0}
            mangaId={id as string}
            downloadChapter={downloadChapter}
            setChapter={() => {}}
            onChapterHover={prefetchFirstPage}
          />
        </div>
      </div>
    </div>
  );
}
