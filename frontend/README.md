# MangaDB Frontend

<div align="center">
  <img src="public/logo.png" alt="MangaDB Logo" width="200"/>
  <p><em>A sleek, high-performance manga reader built with Next.js 14</em></p>
</div>

![GitHub](https://img.shields.io/github/license/yourusername/manga-reader-frontend)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)

## 🚀 Overview

This repository contains the frontend application for MangaDB, a modern manga reader with advanced caching and a powerful reading interface. Built with Next.js 14 and the App Router, it offers a seamless reading experience across devices.

## ✨ Features

- **📱 Responsive Design** - Enjoy reading on any device with a fully responsive UI
- **🔍 High-Quality Images** - Toggle between high and low quality to suit your connection
- **⚡ Optimized Performance** - Blazing fast page loads with smart prefetching
- **📚 Offline Reading** - IndexedDB caching for reading without internet
- **⌨️ Keyboard Navigation** - Intuitive shortcuts for a seamless reading experience
- **🌙 Dark Mode** - Eye-friendly dark theme for comfortable extended reading
- **🔄 Automatic Token Refresh** - Seamless authentication through axios interceptors
- **📥 Chapter Downloads** - Download entire chapters for offline reading

## 🏗️ Architecture

```
manga-front/
├─ app/                    # Next.js App Router
│  ├─ (features)/          # Feature-based components
│  │  ├─ chapters/         # Chapter listing and management
│  │  ├─ manga/            # Manga browsing and details
│  │  ├─ auth/             # Authentication components
│  ├─ [id]/                # Dynamic manga detail routes
│  │  ├─ chapter/          # Chapter reading page
│  ├─ components/          # Shared UI components
│  │  ├─ ui/               # Base UI components
│  │  ├─ layouts/          # Layout components
├─ lib/                    # Utilities and services
│  ├─ interceptor.ts       # Axios auth interceptors
│  ├─ indexedDB.ts         # Browser database for caching
├─ public/                 # Static assets
├─ styles/                 # Global styles
```

## 🔑 Key Technical Features

### 1. Intelligent Caching with IndexedDB

Store manga pages and metadata locally for offline reading:

```typescript
// Storing images with a 7-day expiration
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

// Clean expired cached items automatically
export const cleanOldEntries = async (): Promise<void> => {
  try {
    const now = Date.now();

    // Clean images (7-day retention)
    const oldImages = await db.images
      .where('timestamp')
      .below(now - CACHE_DURATION.IMAGE)
      .toArray();

    if (oldImages.length > 0) {
      await db.images.bulkDelete(oldImages.map(image => image.key));
      console.log(`Cleaned ${oldImages.length} old images from cache`);
    }
  } catch (error) {
    console.error('Error cleaning old entries from IndexedDB:', error);
  }
};
```

### 2. Enhanced Reading Experience

The reading interface includes multiple navigation methods:

```tsx
// Chapter reading component with multiple navigation methods
const ChapterReader = ({ images, currentPage, totalPages }) => {
  // Navigation with keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd') {
        navigateToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        navigateToPrevPage();
      } else if (e.key === 'Home') {
        navigateToFirstPage();
      } else if (e.key === 'End') {
        navigateToLastPage();
      } else if (e.key === 'Escape') {
        navigateToChapterList();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  // Render reading interface with click zones and hover controls
  return <div className="reader-container">{/* Navigation overlays and image display */}</div>;
};
```

### 3. Automatic Token Refresh

Authentication is seamlessly handled with axios interceptors:

```typescript
// Axios instance with token refresh
const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Handle authentication errors and refresh tokens
  instance.interceptors.response.use(
    response => response,
    async error => {
      if (isAuthError(error) && error.config) {
        try {
          const newToken = await handleTokenRefresh(token);
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return axios(error.config);
        } catch (refreshError) {
          // Handle failed refresh
          localStorage.removeItem('authToken');
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};
```

### 4. Progressive Enhancement

The application is built with progressive enhancement in mind:

- Works without JavaScript for basic content viewing
- Enhanced features when JavaScript is enabled
- Offline functionality with service worker and IndexedDB
- Responsive design adapts to any screen size

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- [MangaDB Backend API](https://github.com/yourusername/manga-reader-backend) running locally or deployed

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/manga-reader-frontend.git
cd manga-reader-frontend
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Configure environment variables

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_API_URL="http://localhost:3004"
NEXT_PUBLIC_FRONT_END_URL="http://localhost:3005"
```

4. Run the development server

```bash
npm run dev
# or
yarn dev
```

5. Open your browser

Navigate to [http://localhost:3005](http://localhost:3005) to see the application.

## 🔧 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 📚 Key Components

### Reader Interface

- **ChapterReader** - Main reading interface with image display and navigation
- **NavigationOverlay** - Overlay with navigation controls
- **PageIndicator** - Shows current page and total pages
- **QualityToggle** - Switch between high and low quality images
- **KeyboardShortcuts** - Component showing available keyboard shortcuts

### Manga Browsing

- **MangaGrid** - Display manga in a responsive grid
- **MangaCard** - Card displaying manga cover and basic info
- **ChapterList** - List of chapters for a manga
- **SearchBar** - Search functionality for finding manga

### Authentication

- **LoginForm** - User login form
- **AuthProvider** - Context provider for authentication state

## 🛠️ Built With

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Axios](https://axios-http.com/) - HTTP client
- [Dexie.js](https://dexie.org/) - IndexedDB wrapper
- [React Query](https://tanstack.com/query/latest) - Data fetching and caching

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [MangaDB Backend](https://github.com/yourusername/manga-reader-backend) - Fastify backend API for this frontend

---

<div align="center">
  <p>If you found this project useful, please consider giving it a star! ⭐</p>
</div>
