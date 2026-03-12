import { executeQuery, executeSingle } from "../config/oracle";
import { buildPaginationMeta, resolvePagination } from "../lib/pagination";
import { appendPagination, buildWhere } from "../lib/sql";
import { AppError, SuccessItemResponse, SuccessListResponse } from "../types/api";

export interface PedidosQuery {
  page?: number;
  limit?: number;
  pedidoId?: number;
  filial?: string;
  status?: string;
  dataFatInicio?: string;
  dataFatFim?: string;
}

export async function listPedidos(query: PedidosQuery): Promise<SuccessListResponse<Record<string, unknown>>> {
  const pagination = resolvePagination(query);
  const where = buildWhere([
    {
      clause: "(PEDIDO_ID = :pedidoId OR NUMPED = :pedidoId)",
      bindName: "pedidoId",
      value: query.pedidoId
    },
    {
      clause: "FILIAL = :filial",
      bindName: "filial",
      value: query.filial
    },
    {
      clause: "STATUS = :status",
      bindName: "status",
      value: query.status
    },
    {
      clause: "DATA_FAT >= TO_DATE(:dataFatInicio, 'YYYY-MM-DD')",
      bindName: "dataFatInicio",
      value: query.dataFatInicio
    },
    {
      clause: "DATA_FAT < TO_DATE(:dataFatFim, 'YYYY-MM-DD') + 1",
      bindName: "dataFatFim",
      value: query.dataFatFim
    }
  ]);

  const countSql = `SELECT COUNT(1) AS TOTAL FROM WINTHOR.VW_VEXOR_PEDIDOS${where.sql}`;
  const totalRow = await executeSingle<{ TOTAL: number }>(countSql, where.binds);
  const total = Number(totalRow?.TOTAL ?? 0);

  const listSql = appendPagination(
    `SELECT * FROM WINTHOR.VW_VEXOR_PEDIDOS${where.sql} ORDER BY COALESCE(DATA_FAT, DATA_PEDIDO) DESC, COALESCE(PEDIDO_ID, NUMPED) DESC`
  );

  const rows = await executeQuery<Record<string, unknown>>(listSql, {
    ...where.binds,
    offset: pagination.offset,
    limit: pagination.limit
  });

  return {
    success: true,
    data: rows,
    pagination: buildPaginationMeta(pagination.page, pagination.limit, total)
  };
}

export async function getPedidoById(id: number): Promise<SuccessItemResponse<Record<string, unknown>>> {
  const sql = `
    SELECT *
    FROM WINTHOR.VW_VEXOR_PEDIDOS
    WHERE PEDIDO_ID = :id OR NUMPED = :id
    ORDER BY COALESCE(DATA_FAT, DATA_PEDIDO) DESC
    FETCH FIRST 1 ROWS ONLY
  `;

  const row = await executeSingle<Record<string, unknown>>(sql, { id });

  if (!row) {
    throw new AppError("Pedido not found", 404);
  }

  return {
    success: true,
    data: row
  };
}
