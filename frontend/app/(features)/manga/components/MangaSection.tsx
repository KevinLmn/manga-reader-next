'use client';
import api from '@/lib/interceptor';
import { Loading } from '@components/ui/loading';
import { Reveal } from '@components/ui/Reveal';
import { usePrefetchMangaCover, usePrefetchMangaDetails } from '@lib/queries';
import { useQueryClient } from '@tanstack/react-query';
import { MangaCard } from './MangaCard';

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

export interface Manga {
  id: string;
  attributes: MangaAttributes;
  relationships: MangaRelationship[];
}

interface MangaSectionProps {
  mangas: Manga[];
  sectionType: SectionType;
  isLoading: boolean;
}

const MangaSection = ({ mangas, sectionType, isLoading }: MangaSectionProps) => {
  const prefetchManga = usePrefetchMangaDetails();
  const prefetchMangaCover = usePrefetchMangaCover();

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
          <MangaCard
            key={manga.id}
            manga={manga}
            index={index}
            onHover={() => {
              prefetchManga(manga.id);
              const coverArt = manga.relationships.find(el => el.type === 'cover_art');
              if (coverArt) {
                prefetchMangaCover(manga.id, coverArt.attributes.fileName, '512');
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MangaSection;
