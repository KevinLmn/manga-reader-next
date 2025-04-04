import { Input } from '@/app/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';

export function MangaList({ search, setSearch, handleSubmit, mangas }) {
  console.log(mangas);
  return (
    <div className="flex flex-col min-h-screen w-[100%]">
      <header className="bg-gray-900 text-white py-6 px-4 md:px-6 ">
        <div className="container mx-auto flex items-center justify-between">
          <Link className="text-2xl font-bold" href="#">
            Manga Search
          </Link>
          <form onSubmit={handleSubmit} className="relative w-full max-w-md">
            <Input
              className="bg-gray-800 border-none text-white pl-10 pr-4 py-2 rounded-md focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Search for a manga..."
              type="search"
              onChange={e => setSearch(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </form>
        </div>
      </header>
      <main className="flex-1 py-10 px-4 md:px-6 h-[100%] pt">
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mangas &&
            mangas.length > 0 &&
            mangas.map(el => (
              <div key={el.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Link href={`/${el.id}`}>
                  <Image
                    alt="Manga Cover"
                    className="w-full h-48 object-cover"
                    height="300"
                    src={`https://uploads.mangadex.org/covers/${el.id}/${
                      el.relationships.filter(el => el.type === 'cover_art')[0].attributes.fileName
                    }.256.jpg`}
                    style={{
                      aspectRatio: '200/300',
                      objectFit: 'cover',
                    }}
                    width="200"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2">{el.attributes.title.en}</h3>
                    <p className="text-gray-600 line-clamp-2">{el.attributes.description.en}</p>
                  </div>
                </Link>
              </div>
            ))}
        </div>
      </main>
      <footer className="bg-gray-900 text-white py-4 px-4 md:px-6">
        <div className="container mx-auto text-center text-sm">
          © 2024 Manga Search. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export function SearchIcon(props) {
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
