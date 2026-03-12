import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getEntregaByNota, listEntregas } from "../services/entregas.service";

const entregasQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  numNota: z.coerce.number().int().positive().optional(),
  numPed: z.coerce.number().int().positive().optional()
});

const entregaParamsSchema = z.object({
  nota: z.coerce.number().int().positive()
});

export async function entregasRoutes(app: FastifyInstance): Promise<void> {
  app.get("/entregas", async (request) => {
    const query = entregasQuerySchema.parse(request.query);
    return listEntregas(query);
  });

  app.get("/entregas/:nota", async (request) => {
    const params = entregaParamsSchema.parse(request.params);
    return getEntregaByNota(params.nota);
  });
}
