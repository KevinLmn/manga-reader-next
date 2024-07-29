"use client";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./Reveal";

export enum SectionType {
  LatestUpdates = "LatestUpdates",
  Popular = "Popular",
}

const MangaSection = ({ mangas, sectionType }) => {
  const getTimePassedSince = (date) => {
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
          {sectionType === SectionType.LatestUpdates
            ? "Latest Updates"
            : "Popular"}
        </div>
      </Reveal>
      <div className="mt-4 bg-neutral-800 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mangas.map((manga, index) => (
          <div
            key={manga.id}
            className="rounded-lg overflow-hidden bg-neutral-800 shadow-manga-list flex"
          >
            <Link href={`/${manga.id}`} className="h-full w-full flex flex-col">
              <Image
                alt="Manga Cover"
                className="w-full object-cover"
                height="200"
                src={`https://uploads.mangadex.org/covers/${manga.id}/${
                  manga.relationships.filter((el) => el.type === "cover_art")[0]
                    .attributes.fileName
                }.256.jpg`}
                style={{
                  aspectRatio: "80/70",
                  objectFit: "cover",
                  width: "full",
                }}
                width="133"
              />
              <Reveal>
                <div className="p-2 flex flex-col gap-1 justify-between w-full h-full">
                  <h3 className="text-lg font-bold line-clamp-1">
                    {manga.attributes.title.en}
                  </h3>
                  <p className="line-clamp-2 text-start">
                    {manga.attributes.description.en}
                  </p>
                  <div className="flex justify-between">
                    <p>
                      {manga.attributes.lastChapter &&
                        `Last Chapter : ${manga.attributes.lastChapter}`}
                    </p>
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
