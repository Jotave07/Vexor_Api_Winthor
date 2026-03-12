import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getCargaById, listCargas, listPedidosByCargaId } from "../services/cargas.service";

const cargasQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  cargaId: z.coerce.number().int().positive().optional(),
  filial: z.string().trim().min(1).optional(),
  motoristaId: z.coerce.number().int().positive().optional()
});

const cargaParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

const cargaPedidosQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional()
});

export async function cargasRoutes(app: FastifyInstance): Promise<void> {
  app.get("/cargas", async (request) => {
    const query = cargasQuerySchema.parse(request.query);
    return listCargas(query);
  });

  app.get("/cargas/:id", async (request) => {
    const params = cargaParamsSchema.parse(request.params);
    return getCargaById(params.id);
  });

  app.get("/cargas/:id/pedidos", async (request) => {
    const params = cargaParamsSchema.parse(request.params);
    const query = cargaPedidosQuerySchema.parse(request.query);
    return listPedidosByCargaId(params.id, query);
  });
}
