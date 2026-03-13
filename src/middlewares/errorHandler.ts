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

  const oracleError = error as Error & { code?: string; errorNum?: number };

  if (oracleError.code?.startsWith("ORA-") || oracleError.code?.startsWith("NJS-")) {
    reply.status(503).send({
      success: false,
      message: `Oracle error: ${oracleError.code}${oracleError.message ? ` - ${oracleError.message}` : ""}`
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
