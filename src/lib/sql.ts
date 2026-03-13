import { BindParameters } from "oracledb";

type BindValue = string | number | bigint | Date | Buffer | null;

export interface BuiltQuery {
  sql: string;
  binds: BindParameters;
}

export interface WhereClause {
  clause: string;
  bindName?: string;
  value?: BindValue;
}

export function buildWhere(clauses: WhereClause[]): BuiltQuery {
  const active = clauses.filter((clause) => clause.value !== undefined && clause.value !== null && clause.value !== "");
  const binds: BindParameters = {};

  for (const clause of active) {
    if (clause.bindName) {
      binds[clause.bindName] = clause.value;
    }
  }

  const sql = active.length > 0 ? ` WHERE ${active.map((clause) => clause.clause).join(" AND ")}` : "";

  return { sql, binds };
}

export function appendPagination(baseSql: string): string {
  return `
    SELECT *
    FROM (
      SELECT paged_query.*, ROW_NUMBER() OVER (${extractOrderByClause(baseSql)}) AS RN
      FROM (${removeOrderByClause(baseSql)}) paged_query
    )
    WHERE RN > :offset AND RN <= (:offset + :limit)
  `;
}

function extractOrderByClause(sql: string): string {
  const orderByMatch = sql.match(/ORDER BY[\s\S]*$/i);

  if (!orderByMatch) {
    throw new Error("Pagination queries require ORDER BY for Oracle 11g compatibility");
  }

  return orderByMatch[0];
}

function removeOrderByClause(sql: string): string {
  return sql.replace(/ORDER BY[\s\S]*$/i, "").trim();
}

export function wrapSingleResult(baseSql: string): string {
  return `
    SELECT *
    FROM (
      ${baseSql}
    )
    WHERE ROWNUM = 1
  `;
}
