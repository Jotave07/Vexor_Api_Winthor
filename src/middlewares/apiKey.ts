import { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../config/env";

export async function apiKeyMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const header = request.headers["x-api-key"];
  const queryApiKey =
    env.NODE_ENV === "development" && request.query && typeof request.query === "object" && "apiKey" in request.query
      ? String((request.query as Record<string, unknown>).apiKey ?? "")
      : undefined;
  const providedApiKey = header ?? queryApiKey;

  if (providedApiKey !== env.API_KEY) {
    await reply.status(401).send({
      success: false,
      message: "Unauthorized"
    });
    return;
  }
}
