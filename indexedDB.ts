import Dexie from "dexie";

const ONE_MINUTE = 1 * 60 * 1000;

type ImageType = {
  key: string;
  base64Image: string;
  timestamp: number;
};

type TotalType = {
  key: string;
  value: string;
  timestamp: number;
};

class MangaDB extends Dexie {
  images!: Dexie.Table<ImageType, ImageType["key"]>;
  total!: Dexie.Table<TotalType, TotalType["key"]>;

  constructor() {
    super("mangaDB");
    this.version(1).stores({
      images: "key, base64Image, timestamp",
      total: "key, value, timestamp",
    });
  }
}

const db = new MangaDB();

export const setImageInDB = async (key: string, base64Image: string) => {
  const timestamp = Date.now();
  await db.table("images").put({ key, base64Image, timestamp });
};

export const getImageFromDB = async (key: string) => {
  const entry = await db.images.get(key);
  return entry ? entry.base64Image : null;
};

export const setMetadataInDB = async (key: string, value: string) => {
  const timestamp = Date.now();
  await db.total.put({ key, value, timestamp });
};

export const getMetadataFromDB = async (key: string) => {
  const entry = await db.total.get(key);
  return entry ? entry.value : null;
};

export const cleanOldEntries = async () => {
  const now = Date.now();

  const cleanStore = async (storeName: "images" | "total") => {
    const allEntries = await db[storeName].toArray();

    for (const entry of allEntries) {
      if (now - entry.timestamp > ONE_MINUTE) {
        await db[storeName].delete(entry.key);
      }
    }
  };

  await cleanStore("images");
  await cleanStore("total");
};
