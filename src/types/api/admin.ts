import type { AdminCategory, AdminOrder, AdminUser, EntityId, ProductEntity, Size, Color } from "../entities";
import type { ApiErrorDto, ApiResponseDto, DeleteResponseData, EmptyRequestDto } from "./common";
import type { CreateProductRequestDto } from "./catalog";

export interface AdminStatsDto { salesTotal: number; ordersCount: number; productsCount: number; usersCount: number; }
export type GetAdminStatsRequestDto = EmptyRequestDto;
export type GetAdminStatsResponseDto = ApiResponseDto<AdminStatsDto>;
export type GetAdminStatsErrorDto = ApiErrorDto;

export type GetAdminCategoriesResponseDto = ApiResponseDto<AdminCategory[]>;
export type GetAdminCategoriesRequestDto = EmptyRequestDto;
export type GetAdminCategoriesErrorDto = ApiErrorDto;
export type CreateAdminCategoryRequestDto = Omit<AdminCategory, "id">;
export type CreateAdminCategoryResponseDto = ApiResponseDto<AdminCategory>;
export type CreateAdminCategoryErrorDto = ApiErrorDto;
export interface UpdateAdminCategoryRequestDto { id: EntityId; data: Partial<Omit<AdminCategory, "id">>; }
export type UpdateAdminCategoryResponseDto = ApiResponseDto<AdminCategory>;
export type UpdateAdminCategoryErrorDto = ApiErrorDto;
export interface DeleteAdminCategoryRequestDto { id: EntityId; }
export type DeleteAdminCategoryResponseDto = ApiResponseDto<DeleteResponseData>;
export type DeleteAdminCategoryErrorDto = ApiErrorDto;

export type GetAdminProductsResponseDto = ApiResponseDto<ProductEntity[]>;
export type GetAdminProductsRequestDto = EmptyRequestDto;
export type GetAdminProductsErrorDto = ApiErrorDto;
export type CreateAdminProductRequestDto = CreateProductRequestDto;
export type CreateAdminProductResponseDto = ApiResponseDto<ProductEntity>;
export type CreateAdminProductErrorDto = ApiErrorDto;
export interface UpdateAdminProductRequestDto {
  id: EntityId;
  data: Partial<Omit<ProductEntity, "id">> & {
    name?: string;
    price?: number;
    size?: Size[];
    color?: Color[];
    image?: string;
    images?: string[];
  };
}
export type UpdateAdminProductResponseDto = ApiResponseDto<ProductEntity>;
export type UpdateAdminProductErrorDto = ApiErrorDto;
export interface ToggleAdminProductStatusRequestDto { id: EntityId; }
export type ToggleAdminProductStatusResponseDto = ApiResponseDto<ProductEntity>;
export type ToggleAdminProductStatusErrorDto = ApiErrorDto;
export interface DeleteAdminProductRequestDto { id: EntityId; }
export type DeleteAdminProductResponseDto = ApiResponseDto<DeleteResponseData>;
export type DeleteAdminProductErrorDto = ApiErrorDto;

export type GetAdminUsersResponseDto = ApiResponseDto<AdminUser[]>;
export type GetAdminUsersRequestDto = EmptyRequestDto;
export type GetAdminUsersErrorDto = ApiErrorDto;
export interface UpdateAdminUserRequestDto { id: EntityId; data: Partial<Omit<AdminUser, "id">>; }
export type UpdateAdminUserResponseDto = ApiResponseDto<AdminUser>;
export type UpdateAdminUserErrorDto = ApiErrorDto;

export type GetAdminOrdersResponseDto = ApiResponseDto<AdminOrder[]>;
export type GetAdminOrdersRequestDto = EmptyRequestDto;
export type GetAdminOrdersErrorDto = ApiErrorDto;
export interface UpdateAdminOrderRequestDto { id: EntityId; data: Partial<Omit<AdminOrder, "id">>; }
export type UpdateAdminOrderResponseDto = ApiResponseDto<AdminOrder>;
export type UpdateAdminOrderErrorDto = ApiErrorDto;
export interface DeleteAdminOrderRequestDto { id: EntityId; }
export type DeleteAdminOrderResponseDto = ApiResponseDto<DeleteResponseData>;
export type DeleteAdminOrderErrorDto = ApiErrorDto;

export type AdminMutationErrorDto = ApiErrorDto;
export type AdminDeleteResponseDto = ApiResponseDto<DeleteResponseData>;
