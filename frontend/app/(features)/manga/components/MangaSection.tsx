'use client';
import { Loading } from '@components/ui/loading';
import { Reveal } from '@components/ui/Reveal';
import { usePrefetchMangaDetails } from '@lib/queries';
import { getProxiedImageUrl } from '@lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export enum SectionType {
  LatestUpdates = 'LatestUpdates',
  Popular = 'Popular',
}

interface MangaRelationship {
  type: string;
  attributes: {
    fileName: string;
  };
}

interface MangaAttributes {
  title: {
    en: string;
  };
  description: {
    en: string;
  };
  lastChapter?: string;
  updatedAt?: string;
}

interface Manga {
  id: string;
  attributes: MangaAttributes;
  relationships: MangaRelationship[];
}

interface MangaSectionProps {
  mangas: Manga[];
  sectionType: SectionType;
  isLoading: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const MangaSection = ({ mangas, sectionType, isLoading }: MangaSectionProps) => {
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [errorImages, setErrorImages] = useState<Record<string, boolean>>({});
  const prefetchManga = usePrefetchMangaDetails();

  useEffect(() => {
    const newCoverUrls: Record<string, string> = {};
    const newLoadingImages: Record<string, boolean> = {};
    const newErrorImages: Record<string, boolean> = {};

    for (const manga of mangas) {
      const coverArt = manga.relationships.find(el => el.type === 'cover_art');
      if (coverArt) {
        newLoadingImages[manga.id] = true;
        const coverUrl = `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}.256.jpg`;
        newCoverUrls[manga.id] = getProxiedImageUrl(coverUrl);
        newLoadingImages[manga.id] = false;
      }
    }

    setLoadingImages(newLoadingImages);
    setErrorImages(newErrorImages);
    setCoverUrls(newCoverUrls);
  }, [mangas]);

  const getTimePassedSince = (date: string): string => {
    const currentDate = new Date();
    const updatedAt = new Date(date);
    const diff = currentDate.getTime() - updatedAt.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    if (days > 0) {
      return `${days} days ago`;
    } else if (hours > 0) {
      return `${hours} hours ago`;
    } else if (minutes > 0) {
      return `${minutes} minutes ago`;
    } else {
      return `${seconds} seconds ago`;
    }
  };

  const handleMangaHover = (mangaId: string) => {
    prefetchManga(mangaId);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="text-white p-4 mt-4">
      <Reveal>
        <div className="font-semibold text-2xl">
          {sectionType === SectionType.LatestUpdates ? 'Latest Updates' : 'Popular'}
        </div>
      </Reveal>
      <div className="mt-4 bg-neutral-800 p-4 flex gap-2 flex-wrap justify-around">
        {mangas.map((manga, index) => (
          <div
            key={manga.id}
            style={{ width: 350, height: 550 }}
            className="rounded-lg overflow-hidden bg-neutral-800 shadow-manga-list w-[160px] h-[280px]"
            onMouseEnter={() => handleMangaHover(manga.id)}
          >
            <Link href={`/${manga.id}`} className="h-full flex flex-col">
              {loadingImages[manga.id] ? (
                <div className="w-full h-[200px] bg-gray-200 animate-pulse" />
              ) : errorImages[manga.id] ? (
                <div className="w-full h-[200px] bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-400">Failed to load image</span>
                </div>
              ) : coverUrls[manga.id] ? (
                <Image
                  alt="Manga Cover"
                  className="object-cover"
                  height={400}
                  width={400}
                  src={coverUrls[manga.id] as string}
                  style={{
                    aspectRatio: '160/200',
                    objectFit: 'cover',
                    height: 'auto',
                  }}
                  priority={index < 4}
                  onError={() => {
                    setErrorImages(prev => ({ ...prev, [manga.id]: true }));
                  }}
                />
              ) : (
                <div className="w-full h-[200px] bg-gray-200" />
              )}
              <Reveal>
                <div className="p-2 flex flex-col gap-1 justify-between">
                  <h3 className="text-sm font-bold line-clamp-1">
                    {manga.attributes.title.en?.length > 40
                      ? manga.attributes.title.en.substring(0, 40) + '...'
                      : manga.attributes.title.en}
                  </h3>
                  <p className="text-xs line-clamp-2 text-start">
                    {manga.attributes.description.en}
                  </p>
                  <div className="flex justify-between text-xs">
                    <p>{manga.attributes.lastChapter && `Ch.${manga.attributes.lastChapter}`}</p>
                    <p>{getTimePassedSince(manga.attributes.updatedAt || '')}</p>
                  </div>
                </div>
              </Reveal>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MangaSection;
