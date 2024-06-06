"use client";
import { MangaList } from "@/components/manga-list";
import axiosInterceptorInstance from "@/interceptor";
import { useState } from "react";

export default function List() {
  const [search, setSearch] = useState("");
  const [mangas, setMangas] = useState([]);

  const handleSubmit = async (e) => {
    console.log("hello");
    e.preventDefault();
    try {
      const response = await axiosInterceptorInstance.post("/manga", {
        mangaName: search,
      });
      console.log("heyyyyyyyyyyyyyy", response.data.manga.data);
      setMangas(response.data.manga.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <MangaList
      search={search}
      setSearch={setSearch}
      handleSubmit={handleSubmit}
      mangas={mangas}
    />
  );
}
