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
  return `${baseSql} OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
}
