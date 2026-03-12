import oracledb, { BindParameters, Connection, Result, ResultSet } from "oracledb";
import { env } from "./env";

oracledb.autoCommit = false;
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [oracledb.CLOB];

const POOL_ALIAS = "winthorPool";

export async function initOraclePool(): Promise<void> {
  try {
    await oracledb.getPool(POOL_ALIAS);
  } catch {
    await oracledb.createPool({
      poolAlias: POOL_ALIAS,
      user: env.ORACLE_USER,
      password: env.ORACLE_PASSWORD,
      connectString: env.ORACLE_CONNECT_STRING,
      poolMin: env.ORACLE_POOL_MIN,
      poolMax: env.ORACLE_POOL_MAX,
      poolIncrement: env.ORACLE_POOL_INCREMENT,
      queueTimeout: env.ORACLE_QUEUE_TIMEOUT_MS,
      poolTimeout: 60,
      enableStatistics: false
    });
  }
}

export async function closeOraclePool(): Promise<void> {
  try {
    const pool = oracledb.getPool(POOL_ALIAS);
    await pool.close(10);
  } catch {
    // Pool may not exist yet or may already be closed.
  }
}

export async function withOracleConnection<T>(handler: (connection: Connection) => Promise<T>): Promise<T> {
  const pool = oracledb.getPool(POOL_ALIAS);
  const connection = await pool.getConnection();

  try {
    connection.callTimeout = env.ORACLE_CALL_TIMEOUT_MS;
    return await handler(connection);
  } finally {
    await connection.close();
  }
}

export async function executeQuery<T extends Record<string, unknown>>(
  sql: string,
  binds: BindParameters = {},
  options: oracledb.ExecuteOptions = {}
): Promise<T[]> {
  return withOracleConnection(async (connection) => {
    const result = await connection.execute<Record<string, unknown>>(sql, binds, {
      resultSet: false,
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      ...options
    });

    return ((result.rows as T[] | undefined) ?? []).map(normalizeRow);
  });
}

export async function executeSingle<T extends Record<string, unknown>>(
  sql: string,
  binds: BindParameters = {},
  options: oracledb.ExecuteOptions = {}
): Promise<T | null> {
  const rows = await executeQuery<T>(sql, binds, { ...options, maxRows: 1 });
  return rows[0] ?? null;
}

function normalizeRow<T extends Record<string, unknown>>(row: T): T {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, value instanceof Date ? value.toISOString() : value])
  ) as T;
}
