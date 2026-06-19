import type { Category, CategoryName, Color, EntityId, ProductEntity, ProductStatus, Size } from "../entities";
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
export type GetProductsResponseDto = PaginatedResponseDto<ProductEntity>;
export type GetProductsErrorDto = ApiErrorDto;

export type GetProductRequestDto = IdPathRequestDto;
export type GetProductResponseDto = ApiResponseDto<ProductEntity>;
export type GetProductErrorDto = ApiErrorDto;

export interface GetRelatedProductsRequestDto extends IdPathRequestDto { limit?: number; }
export type GetRelatedProductsResponseDto = ApiResponseDto<ProductEntity[]>;
export type GetRelatedProductsErrorDto = ApiErrorDto;

export type GetCategoriesRequestDto = Record<string, never>;
export type GetCategoriesResponseDto = ApiResponseDto<Category[]>;
export type GetCategoriesErrorDto = ApiErrorDto;

export type CreateProductRequestDto = Partial<Omit<ProductEntity, "id" | "metadata">> & {
  // Support legacy flat fields in creation requests for backward-compatible admin forms
  name?: string;
  price?: number;
  size?: Size[];
  color?: Color[];
  image?: string;
  images?: string[];
  category: CategoryName;
  description?: string;
  status?: ProductStatus;
};
export type CreateProductResponseDto = ApiResponseDto<ProductEntity>;

export interface UpdateProductRequestDto {
  id: EntityId;
  data: Partial<Omit<ProductEntity, "id">> & {
    // Support legacy flat fields in update requests for backward-compatible admin forms
    name?: string;
    price?: number;
    size?: Size[];
    color?: Color[];
    image?: string;
    images?: string[];
  };
}
export type UpdateProductResponseDto = ApiResponseDto<ProductEntity>;

export type DeleteProductRequestDto = IdPathRequestDto;
export type DeleteProductResponseDto = ApiResponseDto<DeleteResponseData>;
export type DeleteProductErrorDto = ApiErrorDto;
