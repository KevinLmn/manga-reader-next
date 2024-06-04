"use client";
import { MangaList } from "@/components/manga-list";
import axios from "axios";
import { useState } from "react";

export default function List() {
  const [search, setSearch] = useState("");
  const [mangas, setMangas] = useState([]);

  const handleSubmit = async (e) => {
    console.log("hello");
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3004/manga",
        {
          mangaName: search,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      console.log(response.data);
      setMangas(response.data.manga.data);
      console.log(mangas);
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
