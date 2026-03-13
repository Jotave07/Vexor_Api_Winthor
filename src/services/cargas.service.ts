import { executeQuery, executeSingle } from "../config/oracle";
import { buildPaginationMeta, resolvePagination } from "../lib/pagination";
import { appendPagination, buildWhere, wrapSingleResult } from "../lib/sql";
import { AppError, SuccessItemResponse, SuccessListResponse } from "../types/api";

export interface CargasQuery {
  page?: number;
  limit?: number;
  cargaId?: number;
  filial?: string;
  motoristaId?: number;
}

export async function listCargas(query: CargasQuery): Promise<SuccessListResponse<Record<string, unknown>>> {
  const pagination = resolvePagination(query);
  const where = buildWhere([
    {
      clause: "CARGA_ID = :cargaId",
      bindName: "cargaId",
      value: query.cargaId
    },
    {
      clause: "FILIAL = :filial",
      bindName: "filial",
      value: query.filial
    },
    {
      clause: "MOTORISTA_ID = :motoristaId",
      bindName: "motoristaId",
      value: query.motoristaId
    }
  ]);

  const countSql = `SELECT COUNT(1) AS TOTAL FROM WINTHOR.VW_VEXOR_CARGAS${where.sql}`;
  const totalRow = await executeSingle<{ TOTAL: number }>(countSql, where.binds);
  const total = Number(totalRow?.TOTAL ?? 0);

  const listSql = appendPagination(
    `SELECT * FROM WINTHOR.VW_VEXOR_CARGAS${where.sql} ORDER BY DATA_SAIDA DESC, CARGA_ID DESC`
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

export async function getCargaById(id: number): Promise<SuccessItemResponse<Record<string, unknown>>> {
  const sql = wrapSingleResult(`
    SELECT *
    FROM WINTHOR.VW_VEXOR_CARGAS
    WHERE CARGA_ID = :id
    ORDER BY DATA_SAIDA DESC
  `);

  const row = await executeSingle<Record<string, unknown>>(sql, { id });

  if (!row) {
    throw new AppError("Carga not found", 404);
  }

  return {
    success: true,
    data: row
  };
}

export async function listPedidosByCargaId(
  id: number,
  query: { page?: number; limit?: number }
): Promise<SuccessListResponse<Record<string, unknown>>> {
  void query;
  void id;
  throw new AppError("View WINTHOR.VW_VEXOR_CARGA_PEDIDOS is not available in this database", 503);
}
