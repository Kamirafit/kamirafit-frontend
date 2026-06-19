/** @deprecated Prefer `@/types/entities` for models and `@/types/api` for DTOs. */
export * from "./entities";
export type {
  ApiResponseDto as ApiResponse,
  PaginatedResponseDto as PaginatedResponse,
  ApiErrorDto as ApiErrorResponse,
} from "./api/common";
