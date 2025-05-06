import axios from "axios";
import { FastifyInstance } from "fastify";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("proxy.ts");

export const proxyRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/proxy/image", async (request, reply) => {
    const { url } = request.query as { url: string };
    if (!url) {
      logger.error("Missing URL parameter", 10);
      return reply.status(400).send({ error: "URL is required" });
    }

    try {
      logger.info("Proxying image request", 15, { url });
      const response = await axios.get(url, {
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0",
          Referer: "https://mangadex.org",
        },
      });

      // Set CORS headers
      reply.header("Access-Control-Allow-Origin", "*");
      reply.header("Access-Control-Allow-Methods", "GET, OPTIONS");
      reply.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );

      // Set cache headers
      reply.header("Cache-Control", "public, max-age=31536000");
      reply.header("Content-Type", response.headers["content-type"]);

      logger.info("Successfully proxied image", 30, {
        url,
        contentType: response.headers["content-type"],
      });
      return response.data;
    } catch (error) {
      logger.error("Proxy error", 35, {
        url,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      return reply.status(500).send({ error: "Failed to proxy image" });
    }
  });
};
