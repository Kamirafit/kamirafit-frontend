export type TimeframeOption = "today" | "7d" | "30d" | "90d" | "all";

export interface InventoryMovement {
  id: string;
  type: "SALE" | "RETURN" | "RESERVATION";
  productName: string;
  variantInfo: string;
  quantityChange: number;
  description: string;
  timestamp: string;
}

export interface ProductPerformance {
  id: string;
  name: string;
  image: string;
  category: string;
  price: number;
  status: "active" | "inactive";
  rank: number;
  unitsSold: number;
  revenue: number;
  ordersCount: number;
  velocity: number; // units sold per day
  salesPerDay?: number; // friendly alias for velocity
  currentStock: number;
  inventoryValue: number;
  daysOfInventory: number | null; // estimated days until stockout
  estimatedDaysLeft?: number | null; // friendly alias for daysOfInventory
  averageRating: number;
  reviewCount: number;
  returnCount: number;
  performanceScore: number; // 0 to 100
  classification:
    | "STAR_PERFORMER"
    | "HIGH_VELOCITY"
    | "STABLE"
    | "LACKING"
    | "DEAD_STOCK"
    | "OUT_OF_STOCK";
  actionRecommendation: string;
}

export interface CategoryPerformance {
  id: string;
  name: string;
  rank: number;
  productCount: number;
  unitsSold: number;
  revenue: number;
  revenueShare: number; // percentage of total sales
  averagePrice: number;
  totalStock: number;
  inventoryValue: number;
  deadStockCount: number;
  deadStockValue: number;
  turnoverRatio: number;
  averageRating: number;
  status: "DRIVER_CATEGORY" | "GROWTH_CATEGORY" | "STABLE" | "LACKING";
}

export interface AnalyticsSummary {
  timeframe: TimeframeOption;
  daysCount: number;
  totalRevenue: number;
  totalUnitsSold: number;
  totalOrders: number;
  averageOrderValue: number;
  totalStockUnits: number;
  totalInventoryValue: number;
  deadStockCount: number;
  deadStockValue: number;
  averageStoreRating: number;
  criticalRestockCount: number;
  // Modern inventory metrics:
  physicalStockUnits?: number;
  reservedStockUnits?: number;
  availableStockUnits?: number;
  onlineStockUnits?: number;
  outOfStockCount?: number;
  runningLowCount?: number;
  healthyStockPercent?: number;
}

export interface AnalyticsTimelinePoint {
  date: string;
  label: string;
  revenue: number;
  units: number;
  orders: number;
}

export interface AnalyticsTrends {
  revenueGrowth: number;
  unitsGrowth: number;
  ordersGrowth: number;
  aovGrowth: number;
  previousPeriodRevenue: number;
  previousPeriodOrders: number;
  previousPeriodUnits: number;
  revenueSparkline: number[];
  unitsSparkline: number[];
  stockSparkline: number[];
  deadStockSparkline: number[];
}

export interface BusinessAnalytics {
  summary: AnalyticsSummary;
  timeline?: AnalyticsTimelinePoint[];
  trends?: AnalyticsTrends;
  rankedProducts: ProductPerformance[];
  rankedCategories: CategoryPerformance[];
  deadStockReport: ProductPerformance[];
  recentMovements?: InventoryMovement[];
}
