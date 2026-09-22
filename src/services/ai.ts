import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";

export interface GeneratedProductCopyResponse {
  description: string;
  bulletPoints: string[];
  careInstructions: string;
  suggestedSlug: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface AiAnalyticsInsights {
  timeframe: string;
  generatedAt: string;
  executiveSummary: string;
  healthScore: number;
  healthVerdict: "EXCELLENT" | "STABLE" | "NEEDS_ATTENTION" | "CRITICAL";
  restockAlerts: Array<{
    productName: string;
    currentStock: number;
    dailyVelocity: number;
    daysOfInventory: number | null;
    urgency: "HIGH" | "MEDIUM";
    recommendedRestockUnits: number;
    reasoning: string;
  }>;
  deadStockActionPlan: Array<{
    productName: string;
    tiedUpCapital: number;
    currentStock: number;
    action: "BUNDLE" | "FLASH_SALE" | "CLEARANCE";
    recommendedDiscountPercent: number;
    strategy: string;
  }>;
  categoryOpportunities: Array<{
    categoryName: string;
    revenueShare: number;
    growthTrend: string;
    advice: string;
  }>;
  actionItems: string[];
}

export interface AiAnalyticsQueryResponse {
  answer: string;
  groundedFacts: string[];
}

export const aiService = {
  generateProductCopy: (data: {
    title: string;
    category?: string;
    subcategory?: string;
    colors?: string[];
    fabric?: string;
  }): Promise<GeneratedProductCopyResponse> =>
    unwrapApiResponse<GeneratedProductCopyResponse>(apiClient.post("/ai/generate-product", data, { timeout: 35000 })),

  getAnalyticsInsights: (timeframe: string = "30d", forceRefresh = false): Promise<AiAnalyticsInsights> =>
    unwrapApiResponse<AiAnalyticsInsights>(apiClient.post("/ai/analytics-insights", { timeframe, forceRefresh }, { timeout: 25000 })),

  queryAnalytics: (data: { question: string; timeframe?: string }): Promise<AiAnalyticsQueryResponse> =>
    unwrapApiResponse<AiAnalyticsQueryResponse>(apiClient.post("/ai/analytics-query", data, { timeout: 25000 })),
};

export function useAiGenerateProduct() {
  return useMutation({
    mutationFn: aiService.generateProductCopy,
  });
}

export function useAiAnalyticsInsights(timeframe: string = "30d") {
  return useQuery({
    queryKey: ["admin", "ai-analytics-insights", timeframe],
    queryFn: (context) => {
      const force = (context.meta as { forceRefresh?: boolean } | undefined)?.forceRefresh === true;
      return aiService.getAnalyticsInsights(timeframe, force);
    },
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useAiAnalyticsQuery() {
  return useMutation({
    mutationFn: aiService.queryAnalytics,
  });
}

