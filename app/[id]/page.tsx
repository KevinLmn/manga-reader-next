"use client";
import { ChapterList } from "@/components/chapter-list";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export const LIMIT = 24;

export default function getMangaById() {
  const [chaptersToDownloadFrom, setChaptersToDownloadFrom] = useState({
    to: 0,
    from: 0,
  });
  const [chapters, setChapters] = useState([]);
  const [total, setTotal] = useState([]);
  const [page, setPage] = useState(1);
  const [isToggled, setIsToggled] = useState(false);
  const { id } = useParams();

  const fetchChapters = async () => {
    try {
      if (!isToggled) {
        const response = await axios.post(
          `http://localhost:3004/manga/${id}`,
          {
            limit: LIMIT,
            offset: page - 1,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        console.log(response.data);
        setChapters(response.data.manga.data);
        setTotal(response.data.manga.total);
      } else {
        console.log("hello");
        const response = await axios.get(
          `http://localhost:3004/manga/${id}/chapters`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        console.log(response.data);
        setChapters(response.data.chapters);
        setTotal(response.data.chaptersLength);
      }
      console.log(chapters);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmitDownload = async (e) => {
    try {
      await axios.post(
        `http://localhost:3004/manga/${id}/download/`,
        {
          chaptersToDownloadFrom,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [page, isToggled]);

  return (
    <div>
      <ChapterList
        chapters={chapters}
        page={page}
        setPage={setPage}
        total={total}
        setChaptersToDownloadFrom={setChaptersToDownloadFrom}
        chaptersToDownloadFrom={chaptersToDownloadFrom}
        handleSubmitDownload={handleSubmitDownload}
        setIsToggled={setIsToggled}
        isToggled={isToggled}
        mangaId={id}
      />
    </div>
  );
}
