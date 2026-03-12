import { FastifyInstance } from "fastify";
import { z } from "zod";
import { getPedidoById, listPedidos } from "../services/pedidos.service";

const pedidosQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  pedidoId: z.coerce.number().int().positive().optional(),
  filial: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1).optional(),
  dataFatInicio: z.string().date().optional(),
  dataFatFim: z.string().date().optional()
});

const pedidoParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export async function pedidosRoutes(app: FastifyInstance): Promise<void> {
  app.get("/pedidos", async (request) => {
    const query = pedidosQuerySchema.parse(request.query);
    return listPedidos(query);
  });

  app.get("/pedidos/:id", async (request) => {
    const params = pedidoParamsSchema.parse(request.params);
    return getPedidoById(params.id);
  });
}
