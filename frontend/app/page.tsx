'use client';

import MangaSection, { SectionType } from '@/app/(features)/manga/components/MangaSection';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/app/components/ui/carousel';
import { Loading } from '@/app/components/ui/loading';
import { cleanOldEntries } from '@/lib/indexedDB';
import { useLatestManga, usePopularManga, usePrefetchMangaDetails } from '@/lib/queries';
import { getProxiedImageUrl } from '@/lib/utils';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect } from 'react';

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
    title: {
      en: string;
    };
    description: {
      en: string;
    };
    tags: Array<{
      attributes: {
        name: {
          en: string;
        };
      };
    }>;
  };
  relationships: MangaRelationship[];
}

const MemoizedMangaSection = React.memo(MangaSection);

export default function List() {
  // const [openMenu, setOpenMenu] = useState(false);
  const { data: popularMangas, isLoading: isPopularLoading } = usePopularManga();
  const { data: latestMangas, isLoading: isLatestLoading } = useLatestManga();

  const prefetchManga = usePrefetchMangaDetails();

  const handleMangaHover = (mangaId: string) => {
    prefetchManga(mangaId);
  };

  useEffect(() => {
    cleanOldEntries();
  }, []);

  if (isPopularLoading || isLatestLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full flex relative min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* <Menu openMenu={openMenu} setOpenMenu={setOpenMenu} /> */}
      <div className="w-full">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute text-white text-3xl font-semibold w-full items-center px-6 pt-4 z-10"
          >
            <div className="flex justify-between w-full">
              {/* <button
                onClick={() => setOpenMenu(!openMenu)}
                className="text-white flex items-center hover:bg-gray-800 p-2 rounded-full transition-colors"
              >
                <FontAwesomeIcon className="mr-3 size-8" icon={faList} />
              </button> */}
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-white">
              Popular Titles
            </div>
          </motion.div>
          <Carousel
            opts={{
              align: 'start',
              loop: true,
              active: true,
              watchDrag: () => true,
            }}
            plugins={[Autoplay({ delay: 10000 })]}
            className="w-full h-96 relative left-0 flex overflow-hidden"
          >
            <CarouselContent className="w-full h-full absolute left-0 flex ml-0" style={{}}>
              {popularMangas?.map((manga: Manga, index: number) => (
                <CarouselItem
                  key={index}
                  className="w-full h-full flex relative left-0 pl-0"
                  onMouseEnter={() => handleMangaHover(manga.id)}
                >
                  <div className="w-full h-full absolute z-10 quick-opacity-gradient"></div>
                  <Link
                    href={`/${manga.id}`}
                    className="absolute z-20 h-full w-full flex justify-start items-end ml-12"
                  >
                    <div className="flex h-[70%]">
                      <Image
                        alt={`Carousel Main Image ${2}`}
                        className="rounded-md"
                        height={280}
                        width={180}
                        src={getProxiedImageUrl(
                          `https://uploads.mangadex.org/covers/${manga.id}/${
                            manga.relationships.find(
                              (el: MangaRelationship) => el.type === 'cover_art'
                            )?.attributes?.fileName
                          }.256.jpg`
                        )}
                        decoding="sync"
                        {...(index < 2
                          ? { priority: true, loading: 'eager' }
                          : { loading: 'lazy' })}
                      />
                      <div className="h-full w-[75%] flex flex-col items-between justify-between px-4 text-white pb-10">
                        <p className="font-bold text-2xl">{manga.attributes.title.en}</p>
                        <div className="flex gap-2">
                          {manga.attributes.tags &&
                            manga.attributes.tags.slice(0, 6).map((tag, index: number) => (
                              <p key={index} className="bg-gray-800 rounded-2xl px-2 font-semibold">
                                {tag.attributes.name.en}
                              </p>
                            ))}
                        </div>
                        <p>
                          {manga.attributes.description.en.slice(0, 600)}
                          {manga.attributes.description.en.length > 600 && '...'}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <Image
                    alt={`Carousel Main Image ${1}`}
                    className="w-[100%] h-full object-cover object-top absolute top-0 left-0 right-0 image-box-sizing"
                    fill
                    src={getProxiedImageUrl(
                      `https://uploads.mangadex.org/covers/${manga.id}/${
                        manga.relationships.find((el: MangaRelationship) => el.type === 'cover_art')
                          ?.attributes?.fileName
                      }.512.jpg`
                    )}
                    style={{
                      zIndex: -1,
                    }}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 absolute z-20 top-1/2 transform -translate-y-1/2 p-2 bg-gray-700 text-white rounded-full bottom-0" />
            <CarouselNext className="right-2 absolute z-20 top-1/2 transform -translate-y-1/2 p-2 bg-gray-700 text-white rounded-full" />
          </Carousel>
        </div>
        {popularMangas && (
          <MemoizedMangaSection
            mangas={popularMangas}
            sectionType={SectionType.Popular}
            isLoading={isPopularLoading}
          />
        )}
        {latestMangas && (
          <MemoizedMangaSection
            mangas={latestMangas}
            sectionType={SectionType.LatestUpdates}
            isLoading={isLatestLoading}
          />
        )}
      </div>
    </div>
  );
}
