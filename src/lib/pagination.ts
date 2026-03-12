import { env } from "../config/env";
import { PaginationMeta } from "../types/api";

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface PaginationConfig {
  page: number;
  limit: number;
  offset: number;
}

export function resolvePagination(input: PaginationInput): PaginationConfig {
  const page = Math.max(1, input.page ?? 1);
  const requestedLimit = input.limit ?? env.DEFAULT_PAGE_SIZE;
  const limit = Math.min(env.MAX_PAGE_SIZE, Math.max(1, requestedLimit));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit)
  };
}
