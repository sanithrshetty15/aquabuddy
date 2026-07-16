import { v4 as uuidv4 } from 'uuid';

export interface PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class StandardApiResponseDto<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  timestamp: string;
  requestId: string;
  pagination?: PaginationMetaDto;

  constructor(
    statusCode: number,
    message: string,
    data: T | null = null,
    pagination?: PaginationMetaDto
  ) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.requestId = uuidv4();
    if (pagination) this.pagination = pagination;
  }

  static ok<T>(data: T, message = 'Success', pagination?: PaginationMetaDto) {
    return new StandardApiResponseDto(200, message, data, pagination);
  }

  static created<T>(data: T, message = 'Created successfully') {
    return new StandardApiResponseDto(201, message, data);
  }

  static noContent(message = 'No content') {
    return new StandardApiResponseDto(204, message);
  }

  static paginated<T>(data: T, pagination: PaginationMetaDto, message = 'Success') {
    return new StandardApiResponseDto(200, message, data, pagination);
  }
}
