import type { EntityId } from "../entities";

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorDto {
  success: false;
  code: string;
  message: string;
  details?: ApiErrorDetail[];
  requestId?: string;
}

export interface ApiResponseDto<T> {
  success: true;
  data: T;
  message?: string;
}

export interface PaginationRequestDto {
  page?: number;
  limit?: number;
}

export interface PaginatedResponseDto<T> extends ApiResponseDto<T[]> {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface IdPathRequestDto {
  id: EntityId;
}

export interface DeleteResponseData {
  id: EntityId;
}

export type EmptyRequestDto = Record<string, never>;
export type EmptyResponseData = Record<string, never>;
