'use client';
import { ChapterList } from '@/app/(features)/chapters/chapter-list';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { axiosInterceptorInstance } from '@/lib/interceptor';
import { getProxiedImageUrl } from '@/lib/utils';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const LIMIT = 24;

interface ChaptersToDownload {
  to: number | string;
  from: number | string;
}

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
  const [chaptersToDownloadFrom, setChaptersToDownloadFrom] = useState<ChaptersToDownload>({
    to: 0,
    from: 0,
  });
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [manga, setManga] = useState<Manga>({
    id: '',
    relationships: [],
  });
  const [isToggled, setIsToggled] = useState<boolean>(false);
  const { id } = useParams();

  const fetchChapters = async () => {
    try {
      if (!isToggled) {
        const response = await axiosInterceptorInstance.post(`/manga/${id}?downloaded=false`, {
          limit: LIMIT,
          offset: page - 1,
        });
        setManga(response.data.manga.data);
        setChapters(response.data.chapters.data);
        setTotal(response.data.chapters.total);
      } else {
        const response = await axiosInterceptorInstance.post(
          `/manga/${id}?downloaded=true`,
          {
            limit: LIMIT,
            offset: page - 1,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          }
        );
        setManga(response.data.manga.data);
        setChapters(response.data.chapters);
        setTotal(response.data.chaptersLength);
      }
      console.log(chapters);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmitDownload = async () => {
    try {
      await axios.post(
        process.env.NEXT_PUBLIC_API_URL + `/manga/${id}/download/`,
        {
          chaptersToDownloadFrom,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  const downloadChapter = async (chapterNumber: string) => {
    try {
      await axios.post(
        process.env.NEXT_PUBLIC_API_URL + `/manga/${id}/download/`,
        {
          chaptersToDownloadFrom: {
            to: chapterNumber,
            from: chapterNumber,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [page, isToggled]);

  useEffect(() => {
    if (manga.id && manga.relationships?.length > 0) {
      console.log(manga);
      const coverArt = manga.relationships.find(el => el.type === 'cover_art');
      if (coverArt) {
        console.log(
          `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}.512.jpg`
        );
      }
    }
  }, [manga]);

  const coverFileName = manga?.relationships.find(el => el.type === 'cover_art')?.attributes
    .fileName;
  const coverUrl = coverFileName
    ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}.512.jpg`
    : '';

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container flex h-14 items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container pt-20">
        {manga.attributes && (
          <>
            {/* Hero Section */}
            <Card className="relative overflow-hidden border-0">
              {/* Background Image with Gradient */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={getProxiedImageUrl(coverUrl)}
                  alt="Background"
                  fill
                  className="object-cover blur-sm opacity-30"
                />
              </div>

              {/* Content */}
              <div className="relative z-10 p-6 flex flex-col md:flex-row gap-8">
                {/* Cover Image */}
                <div className="relative h-[400px] w-[280px] shrink-0 rounded-lg overflow-hidden shadow-xl">
                  <Image
                    alt="Cover"
                    src={getProxiedImageUrl(coverUrl)}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col gap-6 py-4">
                  <div>
                    <h1 className="text-4xl font-bold mb-4">{manga.attributes.title.en}</h1>
                    <div className="flex flex-wrap gap-2">
                      {manga.attributes.tags.slice(0, 6).map((tag, index) => (
                        <Button key={index} variant="secondary" size="sm" className="rounded-full">
                          {tag.attributes.name.en}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed max-w-3xl">
                    {manga.attributes.description.en}
                  </p>
                </div>
              </div>
            </Card>

            {/* Chapters Section */}
            <div className="mt-8">
              <Card className="p-6">
                {chapters.length > 0 && (
                  <ChapterList
                    chapters={chapters}
                    downloadChapter={downloadChapter}
                    page={page}
                    setPage={setPage}
                    setChapter={setChapters}
                    total={total}
                    setChaptersToDownloadFrom={setChaptersToDownloadFrom}
                    chaptersToDownloadFrom={chaptersToDownloadFrom}
                    handleSubmitDownload={handleSubmitDownload}
                    mangaId={id as string}
                  />
                )}
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
