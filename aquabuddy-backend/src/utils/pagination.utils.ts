import { Request } from 'express';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from './constants';

/**
 * Standardized pagination parameters extracted from request query.
 */
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

/**
 * Standardized paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Extract and validate pagination parameters from Express request query.
 *
 * Supported query params:
 *   ?page=1&limit=20&sortBy=createdAt&sortOrder=desc
 *
 * @param req Express request
 * @param defaultSort Default field to sort by
 * @param allowedSortFields Fields the client is allowed to sort by (whitelist)
 */
export const extractPagination = (
  req: Request,
  defaultSort: string = 'createdAt',
  allowedSortFields: string[] = ['createdAt', 'updatedAt']
): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE)
  );
  const skip = (page - 1) * limit;

  const requestedSort = (req.query.sortBy as string) || defaultSort;
  const sortBy = allowedSortFields.includes(requestedSort) ? requestedSort : defaultSort;

  const requestedOrder = (req.query.sortOrder as string)?.toLowerCase();
  const sortOrder: 'asc' | 'desc' = requestedOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, skip, sortBy, sortOrder };
};

/**
 * Build a standardized paginated response object.
 *
 * @param items Array of items for the current page
 * @param total Total count of matching records
 * @param params The pagination parameters used
 */
export const buildPaginatedResponse = <T>(
  items: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(total / params.limit);

  return {
    items,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  };
};
