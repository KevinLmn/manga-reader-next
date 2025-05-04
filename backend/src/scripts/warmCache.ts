import axios from "axios";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3012";

async function warmCache() {
  console.log("🔄 Warming cache...");

  const includes = ["author", "cover_art"];
  const contentRating = ["safe"];
  const loginResponse = await axios.post(`${BACKEND_URL}/login`, {
    email: "notneeded@gmail.com",
    password: "notneeded",
  });
  const token = loginResponse.data.access_token;

  try {
    const latestMangaResponse = await axios.get(
      `${process.env.MANGADEX_BASE_URL}/manga`,
      {
        params: {
          includes,
          contentRating,
          limit: 20,
          "order[updatedAt]": "desc",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const latestManga = JSON.stringify(latestMangaResponse.data, null, 2);
    const latestOutPath = path.resolve("cache", "latest.json");
    await fs.writeFile(latestOutPath, latestManga);
  } catch (error) {
    console.error(error);
    throw new Error("Something went wrong with the search");
  }
  try {
    const order = {
      rating: "desc",
      followedCount: "desc",
    };

    const finalOrderQuery: Record<string, string> = {};

    for (const [key, value] of Object.entries(order)) {
      finalOrderQuery[`order[${key}]`] = value;
    }
    const popularMangaResponse = await axios.get(
      `${process.env.MANGADEX_BASE_URL}/manga`,
      {
        params: {
          includes,
          contentRating,
          limit: 20,
          ...finalOrderQuery,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const popularManga = JSON.stringify(popularMangaResponse.data, null, 2);
    const popularOutPath = path.resolve("cache", "popular.json");
    await fs.writeFile(popularOutPath, popularManga);
  } catch (error) {
    console.error(error);
    throw new Error("Something went wrong with the search");
  }
}

await warmCache();
