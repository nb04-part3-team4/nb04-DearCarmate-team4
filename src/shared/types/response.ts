export interface SuccessResponse<T = unknown> {
  status: 'success';
  data: T;
}

export interface ErrorResponse {
  status: 'error';
  message: string;
  errors?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  status: 'success';
  data: T[];
  meta: PaginationMeta;
}
