'use client';

import { SearchIcon } from '@/app/(features)/manga/components/manga-list';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { axiosInterceptorInstance } from '@/lib/interceptor';
import { getProxiedImageUrl } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

const LIMIT = 24;

interface MangaRelationship {
  type: string;
  id: string;
  attributes?: {
    fileName?: string;
    name?: string;
    [key: string]: any;
  };
}

interface Manga {
  id: string;
  attributes: {
    title: { en: string };
    description: { en: string };
    tags: Array<{
      attributes: {
        name: { en: string };
      };
    }>;
  };
  relationships: MangaRelationship[];
}

export default function SearchPage() {
  const [search, setSearch] = useState('');
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const searchedName = params.searchedName as string;

  const fetchMangas = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInterceptorInstance.post('/search', {
        title: searchedName,
        limit: LIMIT,
        offset: (page - 1) * LIMIT,
      });
      setMangas(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching mangas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/search/${search}`);
  };

  useEffect(() => {
    fetchMangas();
  }, [page, searchedName]);

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container flex h-14 items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <form onSubmit={handleSubmit} className="flex-1">
            <div className="relative">
              <Input
                className="pl-10"
                placeholder="Search for a manga..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <main className="container pt-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {mangas.map(manga => {
            const coverArt = manga.relationships.find(
              (el: MangaRelationship) => el.type === 'cover_art'
            );
            const coverUrl = coverArt?.attributes?.fileName
              ? getProxiedImageUrl(
                  `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}.256.jpg`
                )
              : '';

            return (
              <Link key={manga.id} href={`/${manga.id}`}>
                <Card className="overflow-hidden">
                  <div className="relative aspect-[2/3]">
                    <Image
                      src={coverUrl}
                      alt={manga.attributes.title.en}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2">{manga.attributes.title.en}</h3>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Pagination */}
        {total > LIMIT && (
          <div className="mt-8 flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(Math.ceil(total / LIMIT), p + 1))}
              disabled={page >= Math.ceil(total / LIMIT)}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
