"use client";
import CustomPagination from "@/components/Pagination/pagination";
import { Button } from "@/components/ui/button";
import {
  cleanOldEntries,
  getImageFromDB,
  getMetadataFromDB,
  setImageInDB,
  setMetadataInDB,
} from "@/indexedDB";
import axiosInterceptorInstance from "@/interceptor";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export const LIMIT = 24;

const enum Quality {
  HIGH = "high",
  LOW = "low",
}

export default function GetMangaPage() {
  const { id, chapterId, chapterPage } = useParams();
  const [image, setImage] = useState("");
  const [nextImage, setNextImage] = useState("");
  const [previousImage, setPreviousImage] = useState("");
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState(Number(chapterPage));
  const [quality, setQuality] = useState(Quality.HIGH);

  const buildUrl = (chapterId, quality) => {
    return `/manga/chapter/${chapterId}/${chapterPage}?quality=${quality}`;
  };

  const convertImageToBase64 = async (imageUrl) => {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    return `data:image/jpeg;base64,${base64}`;
  };

  const fetchChapters = async () => {
    try {
      const imageKey = `chapter-${chapterId}-page-${chapterPage}-${quality}`;
      const totalKey = `chapter-${chapterId}-total`;
      const cachedImage = await getImageFromDB(imageKey);
      const cachedTotal = await getMetadataFromDB(totalKey);

      if (cachedImage && cachedTotal) {
        setImage(cachedImage);
        setTotal(cachedTotal);
      } else {
        const response = await axiosInterceptorInstance.get(
          buildUrl(chapterId, quality)
        );
        const base64Image = await convertImageToBase64(response.data.url);
        const dbresponse = await setImageInDB(imageKey, base64Image);
        console.log(dbresponse);
        await setMetadataInDB(totalKey, response.data.numberOfPages);
        setImage(base64Image);
        setTotal(response.data.numberOfPages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNextAndPreviousChapters = async () => {
    try {
      const nextPageKey = `chapter-${chapterId}-page-${
        parseInt(chapterPage) + 1
      }-${quality}`;
      const previousPageKey = `chapter-${chapterId}-page-${
        parseInt(chapterPage) - 1
      }-${quality}`;

      const cachedNextImage = await getImageFromDB(nextPageKey);
      const cachedPreviousImage = await getImageFromDB(previousPageKey);

      if (!cachedNextImage) {
        const nextResponse = await axiosInterceptorInstance.get(
          buildUrl(chapterId, quality)
        );
        const nextBase64Image = await convertImageToBase64(
          nextResponse.data.url
        );
        await setImageInDB(nextPageKey, nextBase64Image);
        setNextImage(nextBase64Image);
      } else {
        setNextImage(cachedNextImage);
      }

      if (!cachedPreviousImage) {
        const previousResponse = await axiosInterceptorInstance.get(
          buildUrl(chapterId, quality)
        );
        const previousBase64Image = await convertImageToBase64(
          previousResponse.data.url
        );
        await setImageInDB(previousPageKey, previousBase64Image);
        setPreviousImage(previousBase64Image);
      } else {
        setPreviousImage(cachedPreviousImage);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (page !== Number(chapterPage))
      redirect(`/manga/chapter/${chapterId}/${page}`);
  }, [page]);

  useEffect(() => {
    setImage(null);
    fetchChapters();
    fetchNextAndPreviousChapters();
  }, [quality]);

  useEffect(() => {
    cleanOldEntries();
  }, []);

  return (
    <div className="flex justify-center flex-col">
      <div className="flex justify-around m-2 items-center">
        <Link href={`/${id}`} className="text-center ">
          <Button variant="secondary">Back to Chapter List</Button>
        </Link>
        <Button
          variant="secondary"
          onClick={() =>
            quality === Quality.HIGH
              ? setQuality(Quality.LOW)
              : setQuality(Quality.HIGH)
          }
        >
          Quality : {quality === Quality.HIGH ? "High" : "Low"}
        </Button>
      </div>
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
          <>
            <Image
              src={image}
              alt="logo"
              width={1080}
              height={0}
              className="h-auto"
              priority={true}
            />
          </>
        )}
        <CustomPagination page={page} setPage={setPage} totalPages={total} />
      </div>
    </div>
  );
}
