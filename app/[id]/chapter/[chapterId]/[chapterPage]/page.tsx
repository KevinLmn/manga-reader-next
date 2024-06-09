"use client";
import CustomPagination from "@/components/Pagination/pagination";
import axiosInterceptorInstance from "@/interceptor";
import Image from "next/image";
import Link from "next/link";
import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export const LIMIT = 24;

export default function GetMangaPage() {
  const { id, chapterId, chapterPage } = useParams();
  const [image, setImage] = useState("");
  const [total, setTotal] = useState([]);
  const [page, setPage] = useState(Number(chapterPage));
  const [isToggled, setIsToggled] = useState(false);
  console.log("id", id);
  console.log("chapterId", chapterId);
  const fetchChapters = async () => {
    try {
      const response = await axiosInterceptorInstance.get(
        `/manga/chapter/${chapterId}/${chapterPage}`
      );
      console.log("hello", response.data.url);
      setImage(response.data.url);
      setTotal(response.data.numberOfPages);
      console.log(image, total, "log");
      console.log(`https://${image}`);
      // console.log(response)
      // console.log(response.data);
      // setChapters(response.data.data);
      // setTotal(response.data.total);
    } catch (err) {}
  };

  useEffect(() => {
    if (
      chapterPage !== null &&
      chapterPage !== undefined &&
      page !== Number(chapterPage)
    ) {
      console.log(chapterPage, page);
    }
    // if (Number(page) === 4 && Number(chapterPage) === 3) {
    //   redirect(`/manga/chapter/${chapterId}/${page}`);
    // }
  }, [page]);

  useEffect(() => {
    if (page !== Number(chapterPage))
      redirect(`/manga/chapter/${chapterId}/${page}`);
    console.log(page);
  }, [page]);

  useEffect(() => {
    fetchChapters();
  }, []);

  return (
    <div className="flex justify-center flex-col">
      <Link href={`/${id}`} className="text-center m-2">
        Back to Chapter List
      </Link>
      <div className="flex flex-col h-[100%] relative">
        {Number(chapterPage) > 1 && (
          <Link
            href={`/${id}/chapter/${chapterId}/${parseInt(chapterPage) - 1}`}
            className="h-[100%] top-0 left-0 absolute z-10 w-[50%] cursor-pointer"
          />
        )}
        {Number(chapterPage) < Number(total) && (
          <Link
            href={`/${id}/chapter/${chapterId}/${parseInt(chapterPage) + 1}`}
            className="h-[100%] top-0 right-0 absolute z-10 w-[50%] cursor-pointer"
          />
        )}
        {image && (
          <Image
            src={image}
            alt="logo"
            width={1080}
            height={0}
            className="h-auto"
          />
        )}
        <CustomPagination page={page} setPage={setPage} totalPages={total} />
      </div>
    </div>
  );
}
