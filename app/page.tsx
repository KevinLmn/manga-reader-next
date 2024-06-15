"use client";
import { MangaList, SearchIcon } from "@/components/manga-list";
import Menu from "@/components/menu";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import axiosInterceptorInstance from "@/interceptor";
import { faList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";

export default function List() {
  const [search, setSearch] = useState("naruto");
  const [mangas, setMangas] = useState([]);
  const [openMenu, setOpenMenu] = useState(false);

  const fetchMangaStatistics = async () => {
    try {
      const response = await axiosInterceptorInstance.post("/manga", {
        mangaName: search,
      });
      setMangas(response.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchMangaStatistics();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    console.log("hello");
    e.preventDefault();
    try {
      const response = await axiosInterceptorInstance.post("/manga", {
        mangaName: search,
      });
      setMangas(response.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  // console.log(mangas[0].relationships.filter((rel) => rel.type === "cover_art").fileName;

  return (
    <div className="w-full flex relative">
      <Menu openMenu={openMenu} setOpenMenu={setOpenMenu} />
      <div className="w-full">
        <div>
          <div className="absolute text-white text-3xl font-semibold w-full items-center px-6 pt-4 z-10">
            <div className="flex justify-between w-full">
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className={`text-white flex items-center`}
              >
                <FontAwesomeIcon className="mr-3 size-8" icon={faList} />
              </button>
              <p>My Manga App</p>
              <form
                onSubmit={handleSubmit}
                className="relative w-full max-w-md"
              >
                <Input
                  className="bg-gray-800 border-none text-white pl-10 pr-4 py-2 rounded-md focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="Search for a manga..."
                  type="search"
                  onChange={(e) => setSearch(e.target.value)}
                />
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </form>
            </div>
            <div className="">Popular Titles</div>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: true,
              active: true,
              watchDrag: () => true,
            }}
            plugins={[Autoplay({ delay: 10000 })]}
            className="w-full h-96 relative left-0 flex overflow-hidden"
          >
            <CarouselContent
              className="w-full h-full absolute left-0 flex ml-0"
              style={{}}
            >
              {mangas.map((manga, index) => (
                <CarouselItem
                  key={index}
                  className="w-full h-full flex relative left-0 pl-0"
                >
                  <div className="w-full h-full absolute z-10 quick-opacity-gradient"></div>
                  <div className="absolute z-20 h-full w-full flex justify-start items-end ml-12">
                    <div className="flex h-[70%]">
                      <Image
                        alt={`Carousel Main Image ${2}`}
                        className="rounded-md"
                        height={280}
                        width={180}
                        src={`https://uploads.mangadex.org/covers/${manga.id}/${
                          manga.relationships.filter(
                            (el) => el.type === "cover_art"
                          )[0].attributes.fileName
                        }.256.jpg`}
                      />
                      <div className="h-full w-[75%] flex flex-col items-between justify-between px-4 text-white pb-10">
                        <p className="font-bold text-2xl">
                          {manga.attributes.title.en}
                        </p>
                        <div className="flex gap-2">
                          {manga.attributes.tags &&
                            manga.attributes.tags.map((tag, index) => (
                              <p
                                key={index}
                                className="bg-gray-800 rounded-2xl px-2 font-semibold"
                              >
                                {tag.attributes.name.en}
                              </p>
                            ))}
                        </div>
                        <p>{manga.attributes.description.en}</p>
                      </div>
                    </div>
                  </div>
                  <Image
                    alt={`Carousel Main Image ${1}`}
                    className="w-[100%] h-full object-cover object-top absolute top-0 left-0 right-0 image-box-sizing"
                    fill
                    src={`https://uploads.mangadex.org/covers/${manga.id}/${
                      manga.relationships.filter(
                        (el) => el.type === "cover_art"
                      )[0].attributes.fileName
                    }.512.jpg`}
                    style={{
                      zIndex: -1,
                    }}
                  />
                </CarouselItem>
              ))}
              {/* <CarouselItem
                key={1}
                className="w-full h-full flex relative left-0 overflow-hidden"
              >
                <div className="w-full h-full absolute z-10 quick-opacity-gradient"></div>
                <Image
                  alt={`Carousel Main Image ${1}`}
                  className="w-[100%] h-full object-cover object-top absolute top-0 left-0 right-0 image-box-sizing"
                  fill
                  src={`https://uploads.mangadex.org/covers/${mangas[0].id}/${
                    mangas[0].relationships.filter(
                      (el) => el.type === "cover_art"
                    )[0].attributes.fileName
                  }.512.jpg`}
                  style={{
                    zIndex: -1,
                  }}
                />
              </CarouselItem> */}
            </CarouselContent>
            <CarouselPrevious className="left-2 absolute z-20 top-1/2 transform -translate-y-1/2 p-2 bg-gray-700 text-white rounded-full bottom-0" />
            <CarouselNext className="right-2 absolute z-20 top-1/2 transform -translate-y-1/2 p-2 bg-gray-700 text-white rounded-full" />
          </Carousel>
        </div>
        <MangaList
          search={search}
          setSearch={setSearch}
          handleSubmit={handleSubmit}
          mangas={mangas}
        />
      </div>
    </div>
  );
}
