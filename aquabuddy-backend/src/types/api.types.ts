export interface StandardApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T | null;
  timestamp: string;
  requestId: string;
  pagination?: PaginationMeta;
  errors?: ValidationErrorDetail[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: { field?: string; constraint?: string }[];
    timestamp: string;
    requestId: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface ValidationErrorDetail {
  field?: string;
  constraint?: string;
}

export const createSuccessResponse = <T>(
  data?: T,
  message?: string,
  pagination?: PaginationMeta
): ApiResponse<T> => ({
  success: true,
  data,
  message,
  pagination,
});

export const createPaginationMeta = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrevious: page > 1,
});
