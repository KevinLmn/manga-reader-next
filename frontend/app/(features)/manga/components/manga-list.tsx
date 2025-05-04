'use client';

import React from 'react';

interface Manga {
  id: string;
  attributes: {
    title: {
      en: string;
    };
    description: {
      en: string;
    };
  };
  relationships: Array<{
    type: string;
    attributes: {
      fileName: string;
    };
  }>;
}

interface MangaListProps {
  search: string;
  setSearch: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  mangas: Manga[];
}

export function MangaList({ search, setSearch, handleSubmit, mangas }: MangaListProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manga List</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mangas?.map(manga => (
          <div
            key={manga.id}
            className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800"
          >
            <a href={`/${manga.id}`}>
              <img
                alt={`Cover for ${manga.attributes.title.en}`}
                className="w-full h-48 object-cover"
                src={`https://uploads.mangadex.org/covers/${manga.id}/${
                  manga.relationships.find(rel => rel.type === 'cover_art')?.attributes.fileName ||
                  'no-cover'
                }.256.jpg`}
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{manga.attributes.title.en}</h3>
                <p className="text-gray-600 line-clamp-2 dark:text-gray-300">
                  {manga.attributes.description.en}
                </p>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
