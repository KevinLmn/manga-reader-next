import cors from "@fastify/cors";
import fastify from "fastify";
import { downloadChapterController } from "./controllers/downloadChapter.js";
import { getChapterController } from "./controllers/getChapter.js";
import { getChapterPage } from "./controllers/getChapterPage.js";
import { getLatestMangas } from "./controllers/getLatestMangas.js";
import { getMangaController } from "./controllers/getMangaController.js";
import { getPopularMangas } from "./controllers/getPopularMangas.js";
import { loginController } from "./controllers/login.js";
import { refreshTokenController } from "./controllers/refreshToken.js";
import { searchMangaController } from "./controllers/searchMangaController.js";
import { loginMiddleware } from "./middlewares.js";
import { proxyRoutes } from "./routes/proxy.js";

// declare module "fastify" {
//   interface FastifyRequest {
//     session: {
//       authToken?: string;
//     };
//   }
// }

const server = fastify({
  logger: true,
  ignoreTrailingSlash: true,
});

server.register(cors, {
  origin: process.env.FRONT_END_URL || "http://localhost:3011",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Accept",
    "Authorization",
    "X-Requested-With",
  ],
  exposedHeaders: ["Content-Disposition", "Content-Type", "Content-Length"],
});

server.addHook("preHandler", loginMiddleware);

server.post("/refreshToken", refreshTokenController);

server.post("/login", loginController);

server.post("/manga", searchMangaController);

server.post("/manga/:id", getMangaController);

server.get("/manga/:id/chapter/:chapterNumber", getChapterController);

server.get("/manga/chapter/:chapterId/:chapterPage", getChapterPage);

server.get("/manga/:id/download/:chapterId", downloadChapterController);

server.get("/popular", getPopularMangas);

server.get("/latest", getLatestMangas);

// Register proxy route
server.register(proxyRoutes, { prefix: "/" });

// Add health check route for Render
server.get("/health", async () => {
  return { status: "ok" };
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 3004;
server.listen({ port, host: "127.0.0.1" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is running on port ${port}`);
});

export default server;
