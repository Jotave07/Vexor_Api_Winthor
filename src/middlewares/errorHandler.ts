import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { AppError } from "../types/api";

export function errorHandler(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply): void {
  request.log.error({ err: error }, "Request failed");

  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      success: false,
      message: error.message
    });
    return;
  }

  if (error instanceof ZodError) {
    reply.status(400).send({
      success: false,
      message: error.issues.map((issue) => issue.message).join("; ")
    });
    return;
  }

  reply.status(500).send({
    success: false,
    message: "Internal server error"
  });
}
