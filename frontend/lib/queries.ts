import { getImageFromDB, getMetadataFromDB, setImageInDB, setMetadataInDB } from '@/lib/indexedDB';
import api from '@/lib/interceptor';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

const toBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  return `data:image/jpeg;base64,${btoa(binary)}`;
};
const fetchImage = async (chapterId: string, page: number, quality: string) => {
  const key = `/manga/chapter/${chapterId}/${page}?quality=${quality}`;
  const cached = await getImageFromDB(key);
  if (cached) return cached;

  const { data } = await api.get(key);
  console.log(data, 'data');
  const res = await api.get(`/proxy/image?url=${encodeURIComponent(data.url)}`, {
    responseType: 'arraybuffer',
  });
  try {
    console.log(res.data, 'res.data');
    const base64 = toBase64(res.data);

    await setImageInDB(key, base64);
    return base64;
  } catch (error) {
    console.log(error);
  }
  throw new Error('Failed to fetch image');
};

const fetchFromCache = async (key: string) => {
  const res = await api.get(`/${key}`);
  return res.data.data;
};

export function useLatestManga() {
  return useQuery({
    queryKey: ['latest-manga'],
    queryFn: () => fetchFromCache('latest'),
    staleTime: 1000 * 60 * 60 * 6, // 6h
    gcTime: 1000 * 60 * 60 * 12, // Keep in memory 12h
  });
}

export function usePopularManga() {
  return useQuery({
    queryKey: ['popular-manga'],
    queryFn: () => fetchFromCache('popular'),
    staleTime: 1000 * 60 * 60 * 6,
    gcTime: 1000 * 60 * 60 * 12,
  });
}

export const useCurrentPageImage = (chapterId: string, page: number, quality: string) =>
  useQuery({
    queryKey: ['page-image', chapterId, page, quality],
    queryFn: () => fetchImage(chapterId, page, quality),
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
    gcTime: 1000 * 60 * 60 * 12, // 12 hours
  });

export const useChapterTotalPages = (chapterId: string) =>
  useQuery({
    queryKey: ['chapter-total', chapterId],
    queryFn: async () => {
      const key = `/manga/chapter/${chapterId}/total`;
      console.log('key', key);
      const cached = await getMetadataFromDB(key);
      if (cached) return Number(cached);
      const { data } = await api.get(`/manga/chapter/${chapterId}/1`);
      await setMetadataInDB(key, data.numberOfPages);
      return data.numberOfPages;
    },
    staleTime: 1000 * 60 * 60 * 6,
    gcTime: 1000 * 60 * 60 * 12,
  });

export const usePrefetchAdjacentPages = (chapterId: string, page: number, quality: string) => {
  const client = useQueryClient();
  const pagesToPrefetch = [page + 1, page + 2, page - 1];
  useEffect(() => {
    console.log('chapterId', chapterId, page, quality);
    pagesToPrefetch.forEach(p => {
      if (p > 0) {
        client.prefetchQuery({
          queryKey: ['page-image', chapterId, p, quality],
          queryFn: () => fetchImage(chapterId, p, quality),
          staleTime: 1000 * 60 * 60 * 6,
          gcTime: 1000 * 60 * 60 * 12,
        });
      }
    });
  }, [chapterId, page, quality]);
};
