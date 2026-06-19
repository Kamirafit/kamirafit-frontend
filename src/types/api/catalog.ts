import type { Category, CategoryName, Color, EntityId, Product, ProductStatus, Size } from "../entities";
import type { ApiErrorDto, ApiResponseDto, DeleteResponseData, IdPathRequestDto, PaginatedResponseDto, PaginationRequestDto } from "./common";

export interface GetProductsRequestDto extends PaginationRequestDto {
  search?: string;
  category?: CategoryName;
  sizes?: Size[];
  colors?: Color[];
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  sort?: "price-asc" | "price-desc" | "newest" | "popular";
}
export type GetProductsResponseDto = PaginatedResponseDto<Product>;
export type GetProductsErrorDto = ApiErrorDto;

export type GetProductRequestDto = IdPathRequestDto;
export type GetProductResponseDto = ApiResponseDto<Product>;
export type GetProductErrorDto = ApiErrorDto;

export interface GetRelatedProductsRequestDto extends IdPathRequestDto { limit?: number; }
export type GetRelatedProductsResponseDto = ApiResponseDto<Product[]>;
export type GetRelatedProductsErrorDto = ApiErrorDto;

export type GetCategoriesRequestDto = Record<string, never>;
export type GetCategoriesResponseDto = ApiResponseDto<Category[]>;
export type GetCategoriesErrorDto = ApiErrorDto;

export type CreateProductRequestDto = Omit<Product, "id" | "createdAt" | "rating" | "reviews" | "popularity">;
export type CreateProductResponseDto = ApiResponseDto<Product>;
export type CreateProductErrorDto = ApiErrorDto;

export interface UpdateProductRequestDto { id: EntityId; data: Partial<Omit<Product, "id">>; }
export type UpdateProductResponseDto = ApiResponseDto<Product>;
export type UpdateProductErrorDto = ApiErrorDto;

export type DeleteProductRequestDto = IdPathRequestDto;
export type DeleteProductResponseDto = ApiResponseDto<DeleteResponseData>;
export type DeleteProductErrorDto = ApiErrorDto;
