'use client';
import { Reveal } from '@/app/components/ui/Reveal';
import Image from 'next/image';
import Link from 'next/link';

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
  updatedAt: string;
}

interface Manga {
  id: string;
  attributes: MangaAttributes;
  relationships: MangaRelationship[];
}

interface MangaSectionProps {
  mangas: Manga[];
  sectionType: SectionType;
}

const MangaSection = ({ mangas, sectionType }: MangaSectionProps) => {
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
          >
            <Link href={`/${manga.id}`} className="h-full flex flex-col">
              <Image
                alt="Manga Cover"
                className="object-cover"
                height={400}
                width={400}
                src={`https://uploads.mangadex.org/covers/${manga.id}/${
                  manga.relationships.find(el => el.type === 'cover_art')!.attributes.fileName
                }.256.jpg`}
                style={{
                  aspectRatio: '160/200',
                  objectFit: 'cover',
                }}
              />
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
                    <p>{getTimePassedSince(manga.attributes.updatedAt)}</p>
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
