import { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../config/env";

export async function apiKeyMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const header = request.headers["x-api-key"];

  if (header !== env.API_KEY) {
    await reply.status(401).send({
      success: false,
      message: "Unauthorized"
    });
    return;
  }
}
