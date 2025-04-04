'use client';
import { ChapterList } from '@/app/(features)/chapters/components/chapter-list';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { axiosInterceptorInstance } from '@/lib/interceptor';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export const LIMIT = 24;

export default function GetMangaById() {
  const [chaptersToDownloadFrom, setChaptersToDownloadFrom] = useState({
    to: 0,
    from: 0,
  });
  const [chapters, setChapters] = useState([]);
  const [total, setTotal] = useState([]);
  const [page, setPage] = useState(1);
  const [manga, setManga] = useState({});
  const [isToggled, setIsToggled] = useState(false);
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

  const handleSubmitDownload = async e => {
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

  const downloadChapter = async chapterNumber => {
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

  // uploads.mangadex.org%2Fcovers%2Fd1a9fdeb-f713-407f-960c-8326b586e6fd%2F05f8dcb4-8ea1-48db-a0b1-3a8fbf695e5a.jpg.256.jpg&w=384&q=75
  // https://uploads.mangadex.org/covers/d1a9fdeb-f713-407f-960c-8326b586e6fd/8e74a0f1-09a0-407f-9bfd-d4dc961e54e9.256.jpg

  useEffect(() => {
    console.log(manga);
    console.log(
      `https://uploads.mangadex.org/covers/${manga.id}/${
        manga?.relationships?.filter(el => el.type === 'cover_art')[0].attributes.fileName
      }.512.jpg`
    );
  }, [manga]);

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
                  src={`https://uploads.mangadex.org/covers/${manga.id}/${
                    manga.relationships.find(el => el.type === 'cover_art')?.attributes.fileName
                  }.512.jpg`}
                  alt="Background"
                  fill
                  className="object-cover opacity-20 blur-sm"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
              </div>

              {/* Content */}
              <div className="relative z-10 p-6 flex flex-col md:flex-row gap-8">
                {/* Cover Image */}
                <div className="relative h-[400px] w-[280px] shrink-0 rounded-lg overflow-hidden shadow-xl">
                  <Image
                    alt="Cover"
                    src={`https://uploads.mangadex.org/covers/${manga.id}/${
                      manga.relationships.find(el => el.type === 'cover_art')?.attributes.fileName
                    }.512.jpg`}
                    fill
                    className="object-cover"
                    priority
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Chapters</h2>
                  <div className="flex gap-4">
                    <Button
                      variant={isToggled ? 'default' : 'outline'}
                      onClick={() => setIsToggled(!isToggled)}
                    >
                      {isToggled ? 'Show All' : 'Show Downloaded'}
                    </Button>
                  </div>
                </div>

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
                    setIsToggled={setIsToggled}
                    isToggled={isToggled}
                    mangaId={id}
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
