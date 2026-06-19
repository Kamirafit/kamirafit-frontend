import type { EntityId, Review } from "../entities";
import type { ApiErrorDto, ApiResponseDto } from "./common";

export interface GetReviewsRequestDto { productId: EntityId; }
export type GetReviewsResponseDto = ApiResponseDto<Review[]>;
export type GetReviewsErrorDto = ApiErrorDto;
export type CreateReviewRequestDto = Omit<Review, "id" | "createdAt" | "customerName">;
export type CreateReviewResponseDto = ApiResponseDto<Review>;
export type CreateReviewErrorDto = ApiErrorDto;
