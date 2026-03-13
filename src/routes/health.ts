import { FastifyInstance } from "fastify";
import { env } from "../config/env";
import { withOracleConnection } from "../config/oracle";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async (_request, reply) => {
    try {
      await withOracleConnection(async (connection) => {
        await connection.execute("SELECT 1 FROM DUAL");
      });

      reply.send({
        success: true,
        data: {
          status: "ok",
          database: "up"
        }
      });
    } catch (error) {
      app.log.error({ err: error }, "Healthcheck database probe failed");

      const oracleError = error as Error & { code?: string };
      const response: Record<string, unknown> = {
        success: false,
        message: "Database unavailable"
      };

      if (env.NODE_ENV === "development") {
        response.details = {
          code: oracleError.code ?? null,
          error: oracleError.message
        };
      }

      reply.status(503).send({
        ...response
      });
    }
  });
}
