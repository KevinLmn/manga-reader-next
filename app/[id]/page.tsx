"use client";
import { ChapterList } from "@/components/chapter-list";
import axiosInterceptorInstance from "@/interceptor";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export const LIMIT = 24;

export default function GetMangaById() {
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
        const response = await axiosInterceptorInstance.post(
          `/manga/${id}?downloaded=false`,
          {
            limit: LIMIT,
            offset: page - 1,
          }
        );
        console.log(response.data);
        setChapters(response.data.data);
        setTotal(response.data.total);
      } else {
        console.log("hello");
        const response = await axiosInterceptorInstance.post(
          `/manga/${id}?downloaded=true`,
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

  const downloadChapter = async (chapterNumber) => {
    try {
      await axios.post(
        `http://localhost:3004/manga/${id}/download/`,
        {
          chaptersToDownloadFrom: {
            to: chapterNumber,
            from: chapterNumber,
          },
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
    <div className="flex flex-col">
      <Link className="text-center" href="/">
        Back to Search
      </Link>
      {chapters.length > 0 && (
        <ChapterList
          chapters={chapters}
          downloadChapter={downloadChapter}
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
      )}
    </div>
  );
}
