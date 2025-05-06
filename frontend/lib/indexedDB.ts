import Dexie from 'dexie';

/**
 * Cache duration constants (in milliseconds)
 */
const CACHE_DURATION = {
  SHORT: 10 * 60 * 1000, // 10 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
  IMAGE: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Types for database schema
 */
interface ImageEntry {
  key: string;
  base64Image: string;
  timestamp: number;
}

interface TotalPagesEntry {
  key: string;
  value: string;
  timestamp: number;
}

/**
 * MangaDB - IndexedDB wrapper for manga storage
 * Handles caching of images and total pages
 */
class MangaDB extends Dexie {
  images!: Dexie.Table<ImageEntry, string>;
  totalPages!: Dexie.Table<TotalPagesEntry, string>;

  constructor() {
    super('mangaDB');
    this.version(1).stores({
      images: 'key, timestamp',
      totalPages: 'key, timestamp',
    });
  }
}

// Initialize database
const db = new MangaDB();

/**
 * Store an image in IndexedDB
 * @param key - Unique identifier for the image
 * @param base64Image - Base64 encoded image data
 * @returns Promise resolving to true if successful
 */
export const setImageInDB = async (key: string, base64Image: string): Promise<boolean> => {
  try {
    const timestamp = Date.now();
    await db.images.put({ key, base64Image, timestamp });
    return true;
  } catch (error) {
    console.error('Failed to store image in IndexedDB:', error);
    return false;
  }
};

/**
 * Retrieve an image from IndexedDB
 * @param key - Unique identifier for the image
 * @returns Promise resolving to the base64 image or null if not found
 */
export const getImageFromDB = async (key: string): Promise<string | null> => {
  try {
    const entry = await db.images.get(key);
    return entry ? entry.base64Image : null;
  } catch (error) {
    console.error('Failed to retrieve image from IndexedDB:', error);
    return null;
  }
};

/**
 * Store total pages in IndexedDB
 * @param key - Unique identifier for the total pages
 * @param value - Total pages value
 * @returns Promise resolving to true if successful
 */
export const setTotalPagesInDB = async (key: string, value: string | number): Promise<boolean> => {
  try {
    const timestamp = Date.now();
    await db.totalPages.put({ key, value: String(value), timestamp });
    return true;
  } catch (error) {
    console.error('Failed to store total pages in IndexedDB:', error);
    return false;
  }
};

/**
 * Retrieve total pages from IndexedDB
 * @param key - Unique identifier for the total pages
 * @returns Promise resolving to the total pages value or null if not found
 */
export const getTotalPagesFromDB = async (key: string): Promise<string | null> => {
  try {
    const entry = await db.totalPages.get(key);
    return entry ? entry.value : null;
  } catch (error) {
    console.error('Failed to retrieve total pages from IndexedDB:', error);
    return null;
  }
};

/**
 * Clean old entries from IndexedDB based on their age
 * This prevents the database from growing too large
 * @returns Promise resolving when cleanup is complete
 */
export const cleanOldEntries = async (): Promise<void> => {
  try {
    const now = Date.now();

    const oldImages = await db.images
      .where('timestamp')
      .below(now - CACHE_DURATION.SHORT)
      .toArray();

    if (oldImages.length > 0) {
      await db.images.bulkDelete(oldImages.map(image => image.key));
      console.log(`Cleaned ${oldImages.length} old images from cache`);
    }

    const oldTotalPages = await db.totalPages
      .where('timestamp')
      .below(now - CACHE_DURATION.SHORT)
      .toArray();

    if (oldTotalPages.length > 0) {
      await db.totalPages.bulkDelete(oldTotalPages.map(entry => entry.key));
      console.log(`Cleaned ${oldTotalPages.length} old total pages entries from cache`);
    }
  } catch (error) {
    console.error('Error cleaning old entries from IndexedDB:', error);
  }
};

/**
 * Clear all data from the database
 * Useful for troubleshooting or for a "clear cache" feature
 * @returns Promise resolving when database is cleared
 */
export const clearDatabase = async (): Promise<void> => {
  try {
    await db.images.clear();
    await db.totalPages.clear();
    console.log('IndexedDB storage cleared');
  } catch (error) {
    console.error('Failed to clear IndexedDB storage:', error);
  }
};
