# MangaDB Backend API

<div align="center">
  <img src="https://raw.githubusercontent.com/yourusername/manga-reader-frontend/main/public/logo.png" alt="MangaDB Logo" width="200"/>
  <p><em>High-performance backend API for the MangaDB manga reader application</em></p>
</div>

![GitHub](https://img.shields.io/github/license/yourusername/manga-reader-backend)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

## 🚀 Overview

This repository contains the backend API for the MangaDB manga reader application. Built with Fastify for high performance, it handles authentication, image processing, and integration with the MangaDex API.

## ✨ Features

- **⚡ High Performance** - Built with Fastify for blazing fast response times
- **🔄 MangaDex API Integration** - Seamless connection to MangaDex for manga data
- **🖼️ Advanced Image Processing** - Stream and optimize manga images for various devices
- **🔐 Authentication System** - Secure JWT-based authentication with token refresh
- **📊 Concurrency Control** - Smart handling of multiple simultaneous requests
- **📝 Detailed Logging** - Comprehensive logging for debugging and monitoring
- **🧪 Error Handling** - Robust error handling with descriptive messages

## 🏗️ Architecture

```
src/
├─ controllers/        # Route handlers for API endpoints
├─ services/           # Business logic implementation
│  ├─ authService.ts   # Authentication handling
│  ├─ imageService.ts  # Image processing and optimization
│  ├─ mangaDexService.ts # MangaDex API integration
├─ types/              # TypeScript type definitions
├─ utils/              # Utility functions and helpers
├─ routes/             # API route definitions
├─ index.ts            # Main application entry point
```

## 🔑 Key Technical Features

### 1. Optimized Image Processing Pipeline

The backend optimizes manga images using Sharp for efficient processing:

```typescript
// Process and assemble images into a vertical strip
private async processImages(imageBuffers: Buffer[]): Promise<Buffer> {
  // Process image metadata and resize images
  const images = await Promise.all(
    imageBuffers.map(async (buffer, index) => {
      const metadata = await sharp(buffer).metadata()
      const scaleFactor = WANTED_WIDTH / metadata.width
      const scaledHeight = Math.round(metadata.height * scaleFactor)

      // Pre-resize the image to save memory
      const resizedBuffer = await sharp(buffer)
        .resize(WANTED_WIDTH, scaledHeight)
        .toBuffer()

      return { buffer: resizedBuffer, width: WANTED_WIDTH, height: scaledHeight }
    })
  )

  // Calculate total height and create composite image
  const totalHeight = images.reduce((sum, img) => sum + img.height, 0)

  // Generate the final image as a vertical strip
  return await sharp({
    create: { width: WANTED_WIDTH, height: totalHeight, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  })
    .composite(images.map((img, i) => ({
      input: img.buffer,
      top: images.slice(0, i).reduce((sum, prev) => sum + prev.height, 0),
      left: 0
    })))
    .png()
    .toBuffer()
}
```

### 2. Concurrent Downloads with Adaptive Throttling

Dynamically adapts concurrent downloads based on system resources:

```typescript
// Download multiple images with controlled concurrency
async downloadImages(urls: string[]): Promise<Buffer[]> {
  const CONCURRENT_DOWNLOADS = Math.max(2, Math.min(os.cpus().length - 1, 6))

  // Process images in batches to control concurrency
  for (let i = 0; i < urls.length; i += CONCURRENT_DOWNLOADS) {
    const batch = urls.slice(i, i + CONCURRENT_DOWNLOADS)
    // Download batch concurrently with retry logic
    // ...
  }
}
```

### 3. Robust CORS Configuration

Configurable CORS settings to secure the API while allowing frontend access:

```typescript
// CORS configuration
app.register(cors, {
  origin: process.env.NEXT_PUBLIC_FRONT_END_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
  ],
  exposedHeaders: ['Content-Disposition'],
  credentials: true,
  maxAge: 86400,
})
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/manga-reader-backend.git
cd manga-reader-backend
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

Create a `.env` file in the root directory:

```
DATABASE_URL="postgresql://user:password@localhost:5432/manga"
MANGADEX_BASE_URL="https://api.mangadex.org"
PORT=3004
JWT_SECRET="your-jwt-secret"
NEXT_PUBLIC_FRONT_END_URL="http://localhost:3005"
ENVIRONMENT="development"
```

4. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:3004`.

## 🔧 Available Scripts

- `npm run dev` - Start the development server with hot-reload
- `npm run build` - Build the TypeScript project
- `npm start` - Start the production server
- `npm test` - Run tests
- `npm run lint` - Run linter
- `npm run format` - Format code with Prettier

## 📚 API Documentation

### Authentication

- `POST /auth/login` - Login with MangaDex credentials
- `POST /auth/refresh` - Refresh authentication token
- `POST /auth/logout` - Logout and invalidate token

### Manga

- `GET /manga` - Get list of manga
- `GET /manga/:id` - Get manga details
- `GET /manga/:id/chapters` - Get chapters for manga

### Chapters

- `GET /chapters/:id` - Get chapter details
- `GET /chapters/:id/pages` - Get chapter pages
- `GET /chapters/:id/download` - Download chapter as combined image

## 🛠️ Built With

- [Fastify](https://fastify.io/) - Fast and low overhead web framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Prisma](https://prisma.io/) - Database ORM
- [Sharp](https://sharp.pixelplumbing.com/) - High-performance image processing
- [Axios](https://axios-http.com/) - HTTP client
- [JWT](https://jwt.io/) - Authentication tokens

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

- [MangaDB Frontend](https://github.com/yourusername/manga-reader-frontend) - Next.js frontend for this API

---

<div align="center">
  <p>If you found this project useful, please consider giving it a star! ⭐</p>
</div>
