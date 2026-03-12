import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify, { FastifyInstance } from "fastify";
import { env } from "./config/env";
import { apiKeyMiddleware } from "./middlewares/apiKey";
import { errorHandler } from "./middlewares/errorHandler";
import { cargasRoutes } from "./routes/cargas";
import { entregasRoutes } from "./routes/entregas";
import { healthRoutes } from "./routes/health";
import { pedidosRoutes } from "./routes/pedidos";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === "development"
          ? {
              target: "pino-pretty",
              options: {
                translateTime: "SYS:standard",
                ignore: "pid,hostname"
              }
            }
          : undefined
    }
  });

  app.setErrorHandler(errorHandler);

  await app.register(helmet);
  await app.register(cors, {
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",").map((item) => item.trim())
  });

  await app.register(healthRoutes);

  await app.register(async (api) => {
    api.addHook("onRequest", apiKeyMiddleware);
    await api.register(pedidosRoutes);
    await api.register(cargasRoutes);
    await api.register(entregasRoutes);
  }, { prefix: "/api" });

  return app;
}
