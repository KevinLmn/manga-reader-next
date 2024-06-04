"use client";
import axios from "axios";
import Image from "next/image";
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
    <div>
      <button onClick={() => console.log(page)}>click</button>
      {page && (
        <div className="h-100vh overflow-scroll">
          <Image
            width={900}
            height={1600}
            src={page.url}
            alt="image"
            className="overflow-scroll"
          ></Image>
        </div>
      )}
    </div>
  );
};

export default Page;
