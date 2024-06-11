import { openDB } from "idb";

const DB_NAME = "mangaDB";
const DB_VERSION = 1;
const IMAGE_STORE_NAME = "images";
const META_STORE_NAME = "total";
const FIFTEEN_MINUTES = 1 * 60 * 1000;

export const initDB = async () => {
  await openDB(DB_NAME, DB_VERSION + 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
        db.createObjectStore(IMAGE_STORE_NAME, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(META_STORE_NAME)) {
        db.createObjectStore(META_STORE_NAME, { keyPath: "key" });
      }
    },
  });
  const hello = await openDB(DB_NAME, DB_VERSION + 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(META_STORE_NAME)) {
        db.createObjectStore(META_STORE_NAME, { keyPath: "key" });
      }
    },
  });
  return hello;
};

export const setImageInDB = async (key, base64Image) => {
  const db = await initDB();
  const timestamp = Date.now();
  await db.put(IMAGE_STORE_NAME, { key, base64Image, timestamp });
};

export const getImageFromDB = async (key) => {
  const db = await initDB();
  const entry = await db.get(IMAGE_STORE_NAME, key);
  return entry ? entry.base64Image : null;
};

export const setMetadataInDB = async (key, value) => {
  const db = await initDB();
  const timestamp = Date.now();
  await db.put(META_STORE_NAME, { key, value, timestamp });
};

export const getMetadataFromDB = async (key) => {
  const db = await initDB();
  const entry = await db.get(META_STORE_NAME, key);
  return entry ? entry.value : null;
};

export const cleanOldEntries = async () => {
  const db = await initDB();
  const now = Date.now();

  const cleanStore = async (storeName) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const allKeys = await store.getAllKeys();

    for (const key of allKeys) {
      const entry = await store.get(key);
      if (now - entry.timestamp > FIFTEEN_MINUTES) {
        await store.delete(key);
      }
    }

    await tx.done;
  };

  await cleanStore(IMAGE_STORE_NAME);
  await cleanStore(META_STORE_NAME);
};
