import {
  getImageFromDB,
  getTotalPagesFromDB,
  setImageInDB,
  setTotalPagesInDB,
} from '@/lib/indexedDB';
import api from '@/lib/interceptor';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

type PageImageData = {
  base64: string;
  numberOfPages: number;
};

const toBase64 = (buffer: ArrayBuffer | { type: string; data: number[] }): string => {
  let byteArray: Uint8Array;

  if ('type' in buffer && Array.isArray((buffer as any).data)) {
    byteArray = new Uint8Array((buffer as any).data);
  } else {
    byteArray = new Uint8Array(buffer as ArrayBuffer);
  }

  let binary = '';
  for (let i = 0; i < byteArray.byteLength; i++) {
    binary += String.fromCharCode(byteArray[i] ?? 0);
  }
  return `data:image/jpeg;base64,${btoa(binary)}`;
};

const fetchImageAndTotalPages = async (
  chapterId: string,
  page: number,
  quality: string
): Promise<PageImageData> => {
  const key = `/manga/chapter/${chapterId}/${page}?quality=${quality}`;
  const cached = await getImageFromDB(key);
  if (cached) {
    const totalPages = await getTotalPagesFromDB(`/manga/chapter/${chapterId}/total`);
    return { base64: cached, numberOfPages: totalPages ? Number(totalPages) : 0 };
  }
  const { data } = await api.get(key);
  const base64 = toBase64(data.buffer);

  await setImageInDB(key, base64);
  await setTotalPagesInDB(`/manga/chapter/${chapterId}/total`, data.numberOfPages);

  return { base64, numberOfPages: data.numberOfPages };
};

const fetchFromCache = async (key: string) => {
  const res = await api.get(`/${key}`);
  return res.data.data;
};

export function useLatestManga() {
  return useQuery({
    queryKey: ['latest-manga'],
    queryFn: () => fetchFromCache('latest'),
    staleTime: 1000 * 60 * 60 * 1, // 1h
    gcTime: 1000 * 60 * 60 * 2, // Keep in memory 2h
  });
}

export function usePopularManga() {
  return useQuery({
    queryKey: ['popular-manga'],
    queryFn: () => fetchFromCache('popular'),
    staleTime: 1000 * 60 * 60 * 1,
    gcTime: 1000 * 60 * 60 * 2,
  });
}

export const useCurrentPageImage = (chapterId: string, page: number, quality: string) => {
  return useQuery({
    queryKey: ['page-image', chapterId, page, quality],
    queryFn: () => fetchImageAndTotalPages(chapterId, page, quality),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const usePrefetchAdjacentPages = (chapterId: string, page: number, quality: string) => {
  const client = useQueryClient();
  useEffect(() => {
    const pagesToPrefetch = [page + 1, page + 2, page - 1];
    pagesToPrefetch.forEach(p => {
      if (p > 0 && !client.getQueryData(['page-image', chapterId, p, quality])) {
        client.prefetchQuery({
          queryKey: ['page-image', chapterId, p, quality],
          queryFn: () => fetchImageAndTotalPages(chapterId, p, quality),
          staleTime: 1000 * 60 * 5,
          gcTime: 1000 * 60 * 10,
        });
      }
    });
  }, [chapterId, page, quality, client]);
};

export const useMangaDetails = (mangaId: string, page: number = 1) =>
  useQuery({
    queryKey: ['manga-details', mangaId, page],
    queryFn: async () => {
      const { data } = await api.post(`/manga/${mangaId}?downloaded=false`, {
        limit: 24,
        offset: page - 1,
      });
      return data;
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
  });

export const usePrefetchMangaDetails = () => {
  const queryClient = useQueryClient();

  return async (mangaId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['manga-details', mangaId, 1],
      queryFn: async () => {
        const { data } = await api.post(`/manga/${mangaId}?downloaded=false`, {
          limit: 24,
          offset: 0,
        });
        return data;
      },
    });
  };
};

export const usePrefetchFirstPage = (quality: string = 'high') => {
  const client = useQueryClient();

  return (chapterId: string) => {
    client.prefetchQuery({
      queryKey: ['page-image', chapterId, 1, quality],
      queryFn: () => fetchImageAndTotalPages(chapterId, 1, quality),
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    });
  };
};
