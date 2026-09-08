export type CouponDiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface AdminCoupon {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  discountVal: number;
  maxDiscount?: number | null;
  minOrderVal?: number | null;
  startDate: string;
  endDate?: string | null;
  applicableCategoryIds: string[];
  usageLimit?: number | null;
  usedCount: number;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders?: number;
    userCoupons?: number;
  };
}

export interface CreateCouponDto {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  discountVal?: number;
  maxDiscount?: number | null;
  minOrderVal?: number | null;
  startDate?: string;
  endDate?: string | null;
  applicableCategoryIds?: string[];
  usageLimit?: number | null;
  description?: string | null;
  isActive?: boolean;
}

export type UpdateCouponDto = Partial<CreateCouponDto>;

export interface CouponQueryParams {
  search?: string;
  status?: "all" | "active" | "inactive" | "expired";
  page?: number;
  limit?: number;
}

export interface CouponListResponse {
  coupons: AdminCoupon[];
  items?: AdminCoupon[];
  total: number;
  activeCount: number;
  expiredCount: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
