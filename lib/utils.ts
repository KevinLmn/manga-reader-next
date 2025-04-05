import axios from 'axios';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getProxiedImageUrl(originalUrl: string): string {
  console.log('originalUrl', originalUrl);
  if (!originalUrl) return '';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
  // Remove trailing slash if present
  const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  return `${baseUrl}/api/proxy/image?url=${encodeURIComponent(originalUrl)}`;
}

export const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const proxiedUrl = getProxiedImageUrl(imageUrl);
    console.log('Fetching from proxied URL:', proxiedUrl);
    const response = await axios.get(proxiedUrl, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
    });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });
    }
    throw error;
  }
};
