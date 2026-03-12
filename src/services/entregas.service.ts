import { executeQuery, executeSingle } from "../config/oracle";
import { buildPaginationMeta, resolvePagination } from "../lib/pagination";
import { appendPagination, buildWhere } from "../lib/sql";
import { AppError, SuccessItemResponse, SuccessListResponse } from "../types/api";

export interface EntregasQuery {
  page?: number;
  limit?: number;
  numNota?: number;
  numPed?: number;
}

export async function listEntregas(query: EntregasQuery): Promise<SuccessListResponse<Record<string, unknown>>> {
  const pagination = resolvePagination(query);
  const where = buildWhere([
    {
      clause: "(NOTA_FISCAL = :numNota OR NUMNOTA = :numNota)",
      bindName: "numNota",
      value: query.numNota
    },
    {
      clause: "(PEDIDO_ID = :numPed OR NUMPED = :numPed)",
      bindName: "numPed",
      value: query.numPed
    }
  ]);

  const countSql = `SELECT COUNT(1) AS TOTAL FROM WINTHOR.VW_VEXOR_ENTREGAS${where.sql}`;
  const totalRow = await executeSingle<{ TOTAL: number }>(countSql, where.binds);
  const total = Number(totalRow?.TOTAL ?? 0);

  const listSql = appendPagination(
    `SELECT * FROM WINTHOR.VW_VEXOR_ENTREGAS${where.sql} ORDER BY COALESCE(DATA_ENTREGA, DATA_PREVISTA) DESC, COALESCE(NOTA_FISCAL, NUMNOTA) DESC`
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

export async function getEntregaByNota(nota: number): Promise<SuccessItemResponse<Record<string, unknown>>> {
  const sql = `
    SELECT *
    FROM WINTHOR.VW_VEXOR_ENTREGAS
    WHERE NOTA_FISCAL = :nota OR NUMNOTA = :nota
    ORDER BY COALESCE(DATA_ENTREGA, DATA_PREVISTA) DESC
    FETCH FIRST 1 ROWS ONLY
  `;

  const row = await executeSingle<Record<string, unknown>>(sql, { nota });

  if (!row) {
    throw new AppError("Entrega not found", 404);
  }

  return {
    success: true,
    data: row
  };
}
