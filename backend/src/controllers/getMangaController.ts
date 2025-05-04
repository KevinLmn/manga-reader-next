import { Chapter as PrismaChapter } from "@prisma/client";
import axios from "axios";
import { FastifyRequest } from "fastify";
import prisma from "../prisma.js";

type MangaIdRequestBody = {
  limit: number;
  offset: number;
};

type DownloadChapterIdParams = {
  id: string;
};

type MangaIdParams = {
  id: string;
};

type GetDownloadedScansControllerReturnType = {
  chaptersLength: number;
  chapters: PrismaChapter[];
};

type MangaResponse = {
  data: {
    id: string;
    type: string;
    attributes: {
      title: Record<string, string>;
      description: Record<string, string>;
      status: string;
      year: number;
      contentRating: string;
      tags: Array<{
        id: string;
        type: string;
        attributes: { name: Record<string, string> };
      }>;
    };
    relationships: Array<{
      id: string;
      type: string;
      attributes?: Record<string, any>;
    }>;
  };
};

type ChapterResponse = {
  data: Array<{
    id: string;
    type: string;
    attributes: {
      volume: string | null;
      chapter: string;
      title: string | null;
      publishAt: string;
      translatedLanguage: string;
    };
  }>;
  limit: number;
  offset: number;
  total: number;
};

type getNotDownloadedScansByMangaIdResponse = {
  chapters: ChapterResponse;
  manga: MangaResponse;
};

export const getMangaController = async (
  request: FastifyRequest<{
    Body: MangaIdRequestBody;
    Params: DownloadChapterIdParams;
    Querystring: { downloaded?: string };
  }>
): Promise<
  | GetDownloadedScansControllerReturnType
  | getNotDownloadedScansByMangaIdResponse
> => {
  const isDownloaded = request.query.downloaded;

  if (isDownloaded === "true") return getDownloadedScansController(request);
  return getNotDownloadedScansByMangaId(request);
};

const getDownloadedScansController = async (
  request: FastifyRequest<{
    Body: MangaIdRequestBody;
    Params: DownloadChapterIdParams;
  }>
): Promise<GetDownloadedScansControllerReturnType> => {
  const { id } = request.params;
  const { limit, offset } = request.body;

  const chapters = await prisma.chapter.findMany({
    where: {
      mangaId: id,
    },
  });

  return {
    chaptersLength: chapters.length,
    chapters: chapters
      .sort((a, b) => b.number - a.number)
      .slice(offset * limit, Math.min(offset * limit + limit, chapters.length)),
  };
};

const getNotDownloadedScansByMangaId = async (
  request: FastifyRequest<{ Body: MangaIdRequestBody; Params: MangaIdParams }>
): Promise<getNotDownloadedScansByMangaIdResponse> => {
  const { id } = request.params;
  const { limit, offset } = request.body;
  const token = request.headers.authorization;

  try {
    const resp = await axios.get(
      `https://api.mangadex.org/manga/${id}/feed?includeFuturePublishAt=0`,
      {
        params: {
          limit: limit,
          offset: offset * limit,
          "order[chapter]": "desc",
          "translatedLanguage[]": "en",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const includes = ["author", "cover_art"];
    const responseMangaDetail = await axios.get(
      `https://api.mangadex.org/manga/${id}`,
      {
        params: {
          includes,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(responseMangaDetail.data);
    return { manga: responseMangaDetail.data, chapters: resp.data };
  } catch (e) {
    console.error(e);
    throw new Error("Manga not found");
  }
};
