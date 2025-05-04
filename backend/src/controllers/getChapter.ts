import { FastifyReply, FastifyRequest } from "fastify";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import prisma from "../prisma.js";

type ChapterIdParams = {
  id: string;
  chapterNumber: string;
};

export const getChapterController = async (
  request: FastifyRequest<{
    Params: ChapterIdParams;
  }>,
  reply: FastifyReply
) => {
  const { id: mangaId, chapterNumber } = request.params;
  const chapter = await prisma.chapter.findUnique({
    where: {
      number_mangaId: {
        number: Number(chapterNumber),
        mangaId: mangaId,
      },
    },
  });

  // reply.send({
  //   ...chapter,
  //   url: `http://localhost:${process.env.PORT}${chapter.url.replace(
  //     "/home/ikebi/manga-reader",
  //     ""
  //   )}`,
  // }, { "Content-Type": "blop"});
  if (!chapter) {
    reply.status(404).send({ error: "Chapter not found" });
    return;
  }

  if (!fs.existsSync(chapter.url)) {
    reply.status(404).send({ error: "File not found" });
    return;
  }
  const imagePath = chapter.url.replace("/home/ikebi/manga-reader", "");
  const fullPath = path.join("/home/ikebi/manga-reader", imagePath);

  if (!fs.existsSync(fullPath)) {
    reply.status(404).send({ error: "File not found" });
    return;
  }

  try {
    const image = sharp(fullPath);
    const metadata = await image.metadata();
    const height = metadata.height ?? 0;
    const width = metadata.width ?? 0;
    const chunkHeight = 1000; // Define height of each chunk

    if (height === 0 || width === 0) {
      reply.status(500).send({ error: "Invalid image dimensions" });
      return;
    }

    reply.raw.writeHead(200, {
      "Content-Type": "application/octet-stream",
      "Transfer-Encoding": "chunked",
      "Access-Control-Allow-Origin": "*",
    });

    let yOffset = 0;

    while (yOffset < height) {
      const chunkHeightToExtract = Math.min(chunkHeight, height - yOffset);
      const chunk = await image
        .extract({ left: 0, top: yOffset, width, height: chunkHeightToExtract })
        .toBuffer();
      reply.raw.write(chunk);
      yOffset += chunkHeight;
    }

    reply.raw.end();
  } catch (err) {
    if (!reply.raw.headersSent) {
      reply.status(500).send("Internal Server Error");
    } else {
      reply.log.error(err);
      reply.raw.end();
    }
  }
};
