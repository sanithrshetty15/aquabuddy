export interface ErrorDetail {
  field?: string;
  constraint?: string;
}

export interface SerializedError {
  code: string;
  message: string;
  details?: ErrorDetail[];
  timestamp: string;
  requestId: string;
}
