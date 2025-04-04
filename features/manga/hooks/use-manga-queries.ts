import { axiosInterceptorInstance2 } from '@/lib/interceptor';
import { useQuery } from '@tanstack/react-query';

async function fetchWithFallback(endpoint: string, cacheFile: string) {
  try {
    // Try to fetch fresh data
    const response = await axiosInterceptorInstance2.get(
      `${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`
    );
    return response.data.data;
  } catch (error) {
    // If fetch fails, try to get cached data
    try {
      const cachedResponse = await fetch(`/cache/${cacheFile}`);
      if (!cachedResponse.ok) throw new Error('No cache available');
      return (await cachedResponse.json()).data;
    } catch (cacheError) {
      // If both fail, rethrow original error
      throw error;
    }
  }
}

export function useLatestManga() {
  return useQuery({
    queryKey: ['latest-manga'],
    queryFn: () => fetchWithFallback('latest', 'latest.json'),
  });
}

export function usePopularManga() {
  return useQuery({
    queryKey: ['popular-manga'],
    queryFn: () => fetchWithFallback('popular', 'popular.json'),
  });
}
