"use client";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const [page, setPage] = useState("");

  const { id, chapterNumber } = useParams();

  const fetchChapters = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3004/manga/${id}/chapter/${chapterNumber}`
      );
      setPage(response.data);
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  return (
    <div className="flex flex-col items-center">
      <Link href={`/${id}`}> Back to chapter list</Link>
      {page && (
        <div className="h-100vh relative overflow-scroll overflow-x-hidden overflow-y-hidden ">
          <Image
            width={900}
            height={1600}
            src={page.url}
            alt="image"
            className="overflow-scroll"
          />
          <Link
            href={`/${id}/${parseInt(chapterNumber) + 1}`}
            className="h-[100%] top-0 right-0 absolute z-10 w-[50%] cursor-pointer"
            onClick={() => console.log("hello")}
          />
        </div>
      )}
      <Link href={`/${id}`}> Back to chapter list</Link>
    </div>
  );
};

export default Page;
