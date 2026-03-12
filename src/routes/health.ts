import { FastifyInstance } from "fastify";
import { withOracleConnection } from "../config/oracle";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async (_request, reply) => {
    await withOracleConnection(async (connection) => {
      await connection.execute("SELECT 1 FROM DUAL");
    });

    reply.send({
      success: true,
      data: {
        status: "ok"
      }
    });
  });
}
