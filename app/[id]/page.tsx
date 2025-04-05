'use client';
import { ChapterList } from '@/app/(features)/chapters/chapter-list';
import { Card } from '@/app/components/ui/card';
import { axiosInterceptorInstance } from '@/lib/interceptor';
import { getProxiedImageUrl } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [manga, setManga] = useState<Manga>({
    id: '',
    relationships: [],
  });
  const [coverImage, setCoverImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { id } = useParams();

  const fetchChapters = async () => {
    try {
      const response = await axiosInterceptorInstance.post(`/manga/${id}?downloaded=false`, {
        limit: LIMIT,
        offset: page - 1,
      });
      setManga(response.data.manga.data);
      setChapters(response.data.chapters.data);
      setTotal(response.data.chapters.total);
    } catch (err) {
      toast.error('Failed to fetch chapters');
    }
  };

  const downloadChapter = async (chapterId: string) => {
    try {
      toast.info('Starting download...');
      const response = await axiosInterceptorInstance.get(`/manga/${id}/download/${chapterId}`, {
        responseType: 'blob',
      });

      const chapter = chapters.find(c => c.id === chapterId);
      if (!chapter) {
        throw new Error('Chapter not found');
      }

      const blob = new Blob([response.data], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${manga.attributes?.title?.en || 'manga'}_chapter_${chapter.attributes.chapter}.png`;
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
    fetchChapters();
  }, [page]);

  useEffect(() => {
    const fetchCoverImage = async () => {
      if (manga.id && manga.relationships?.length > 0) {
        setIsLoading(true);
        try {
          const coverArt = manga.relationships.find(el => el.type === 'cover_art');
          if (coverArt) {
            const coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}.512.jpg`;
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
  }, [manga]);

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
              alt={manga.attributes?.title?.en || 'Manga Cover'}
              width={300}
              height={450}
              className="aspect-[2/3] w-full rounded-lg object-cover"
            />
          )}
          <div className="mt-4">
            <h1 className="text-2xl font-bold">{manga.attributes?.title?.en}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {manga.attributes?.description?.en}
            </p>
          </div>
        </Card>
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Chapters</h2>
          </div>
          <ChapterList
            chapters={chapters}
            page={page}
            setPage={setPage}
            total={total}
            mangaId={id as string}
            downloadChapter={downloadChapter}
            setChapter={setChapters}
          />
        </div>
      </div>
    </div>
  );
}
