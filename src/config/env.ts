import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.string().default("info"),
  CORS_ORIGIN: z.string().default("*"),
  API_KEY: z.string().min(1, "API_KEY is required"),
  ORACLE_DRIVER_MODE: z.enum(["thin", "thick"]).default("thin"),
  ORACLE_USER: z.string().min(1, "ORACLE_USER is required"),
  ORACLE_PASSWORD: z.string().min(1, "ORACLE_PASSWORD is required"),
  ORACLE_CONNECT_STRING: z.string().min(1, "ORACLE_CONNECT_STRING is required"),
  ORACLE_CONFIG_DIR: z.string().optional(),
  ORACLE_CLIENT_LIB_DIR: z.string().optional(),
  ORACLE_POOL_MIN: z.coerce.number().int().nonnegative().default(1),
  ORACLE_POOL_MAX: z.coerce.number().int().positive().default(10),
  ORACLE_POOL_INCREMENT: z.coerce.number().int().positive().default(1),
  ORACLE_QUEUE_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  ORACLE_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  ORACLE_CALL_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  DEFAULT_PAGE_SIZE: z.coerce.number().int().positive().default(20),
  MAX_PAGE_SIZE: z.coerce.number().int().positive().default(100)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  throw new Error(`Invalid environment variables: ${errors}`);
}

export const env = parsed.data;
