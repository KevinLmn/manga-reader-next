import axios from "axios";
import dotenv from "dotenv";
import { FastifyRequest } from "fastify";
import { MangaDexChapter } from "../utils.js";
dotenv.config();

type MangaRequestBody = {
  mangaName: string;
};

type MangaDexManga = Omit<MangaDexChapter, "links">;

type MangaDexResponse = {
  result: string;
  response: string;
  data: MangaDexManga[];
  limit: number;
  offset: number;
  total: number;
};

export const getLatestMangas = async (
  request: FastifyRequest<{ Body: MangaRequestBody }>
): Promise<MangaDexResponse> => {
  const token = request.headers.authorization;
  const contentRating = ["safe"];
  const includes = ["author", "cover_art"];

  try {
    const resp = await axios.get(`${process.env.MANGADEX_BASE_URL}/manga`, {
      params: {
        includes,
        contentRating,
        limit: 20,
        "order[updatedAt]": "desc",
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const manga: MangaDexResponse = resp.data;
    return { ...manga };
  } catch (error) {
    console.error(error);
    throw new Error("Something went wrong with the search");
  }
};
