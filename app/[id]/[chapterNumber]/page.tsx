"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const canvasRef = useRef(null);
  const { id, chapterNumber } = useParams();

  const fetchChapters = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + `/manga/${id}/chapter/${chapterNumber}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      let yOffset = 0;

      const readChunk = async () => {
        const { done, value } = await reader.read();
        if (done) {
          setLoading(false);
          return;
        }

        if (value) {
          const blob = new Blob([value]);
          const imageUrl = URL.createObjectURL(blob);
          await drawChunk(imageUrl, yOffset);
          yOffset += 1000; // Increment by the chunk height
        }

        await readChunk();
      };

      const drawChunk = (imageUrl, yOffset) => {
        return new Promise((resolve, reject) => {
          const canvas = canvasRef.current;
          if (!canvas) {
            console.error("Canvas not found");
            return reject("Canvas not found");
          }
          const ctx = canvas.getContext("2d");
          const img = new Image();

          img.onload = () => {
            console.log("Image loaded:", img.width, img.height);
            if (canvas.width === 0) {
              canvas.width = img.width;
            }
            if (canvas.height < yOffset + img.height) {
              canvas.height = yOffset + img.height;
            }
            ctx.drawImage(img, 0, yOffset, img.width, img.height);
            URL.revokeObjectURL(imageUrl);
            resolve();
          };

          img.onerror = (err) => {
            console.error("Image load error:", err);
            URL.revokeObjectURL(imageUrl);
            reject(err);
          };

          img.src = imageUrl;
        });
      };

      readChunk();
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchChapters();
  }, [id, chapterNumber]);

  return (
    <div className="flex flex-col items-center">
      <Link href={`/${id}`}> Back to chapter list</Link>
      <div className="h-100vh relative overflow-scroll overflow-x-hidden overflow-y-hidden">
        <canvas ref={canvasRef} className="overflow-scroll"></canvas>
        <Link
          href={`/${id}/${parseInt(chapterNumber) + 1}`}
          className="h-[100%] top-0 right-0 absolute z-10 w-[50%] cursor-pointer"
          onClick={() => console.log("hello")}
        />
      </div>
      <Link href={`/${id}`}> Back to chapter list</Link>
    </div>
  );
};

export default Page;
