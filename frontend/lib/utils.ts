import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getProxiedImageUrl = (originalUrl: string): string => {
  console.log('originalUrl', originalUrl);
  if (!originalUrl) return '';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3012';
  const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  const proxyUrl = `${baseUrl}/proxy/image?url=${originalUrl}`;
  console.log('proxyUrl', proxyUrl);
  return proxyUrl;
};
