import cors from "@fastify/cors";
import fastify from "fastify";
import { downloadChapterController } from "./controllers/downloadChapterController.js";
import { getChapterPageController } from "./controllers/getChapterPageController.js";
import { getChapterTotalPageController } from "./controllers/getChapterTotalPage.js";
import { getLatestMangas } from "./controllers/getLatestMangasController.js";
import { getMangaController } from "./controllers/getMangaController.js";
import { getPopularMangas } from "./controllers/getPopularMangasController.js";
import { loginController } from "./controllers/loginController.js";
import { refreshTokenController } from "./controllers/refreshTokenController.js";
import { loginMiddleware } from "./middlewares.js";
import { proxyRoutes } from "./routes/proxy.js";

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

server.post("/manga/:id", getMangaController);

server.get("/manga/chapter/:chapterId/:chapterPage", getChapterPageController);

server.get("/manga/:id/download/:chapterId", downloadChapterController);

server.get("/popular", getPopularMangas);

server.get("/latest", getLatestMangas);

server.get("/manga/chapter/:chapterId/total", getChapterTotalPageController);

// Register proxy route
server.register(proxyRoutes, { prefix: "/" });

server.get("/health", async () => {
  return { status: "ok" };
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 3012;
server.listen({ port, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is running on port ${port}`);
});

export default server;
