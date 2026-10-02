import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, unwrapApiResponse } from "@/api/client";

export interface InventorySummary {
  totalItems: number;
  totalUnits?: number;
  totalPhysicalStock: number;
  totalReservedStock: number;
  totalAvailableStock: number;
  totalOnlineStock: number;
  physicalStockUnits?: number;
  reservedStockUnits?: number;
  availableStockUnits?: number;
  onlineStockUnits?: number;
  totalStockValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  inStockCount: number;
  storefrontListedCount?: number;
  unlistedCount?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  subcategory?: string | null;
  variantDescription?: string | null;
  variantId?: string | null;
  productId?: string | null;
  physicalStock: number;
  reservedStock: number;
  availableStock: number;
  onlineStock: number;
  unitCost: number;
  stockValue: number;
  location: string;
  lowStockThreshold: number;
  isStorefrontListed: boolean;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  movements?: InventoryMovement[];
}

export interface InventoryMovement {
  id: string;
  inventoryItemId: string;
  itemName?: string;
  itemSku?: string;
  category?: string;
  variantDescription?: string;
  type: "STOCK_ADDED" | "SALE" | "RETURN" | "DAMAGE" | "MANUAL_ADJUSTMENT" | "RESERVATION" | "RESERVATION_RELEASED" | "TRANSFER";
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason?: string | null;
  reference?: string | null;
  createdBy: string;
  createdAt: string;
}

export interface ListInventoryParams {
  search?: string;
  category?: string;
  status?: string;
  storefront?: string;
  location?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateInventoryItemInput {
  name: string;
  sku: string;
  category: string;
  subcategory?: string;
  variantDescription?: string;
  variantId?: string;
  productId?: string;
  physicalStock: number;
  reservedStock?: number;
  onlineStock?: number;
  unitCost: number;
  location?: string;
  lowStockThreshold?: number;
  isStorefrontListed?: boolean;
  notes?: string;
}

export interface UpdateInventoryItemInput {
  name?: string;
  category?: string;
  subcategory?: string;
  variantDescription?: string;
  unitCost?: number;
  location?: string;
  lowStockThreshold?: number;
  isStorefrontListed?: boolean;
  notes?: string;
  onlineStock?: number;
}

export interface AdjustStockInput {
  type: "STOCK_ADDED" | "DAMAGE" | "MANUAL_ADJUSTMENT" | "RESERVATION" | "RESERVATION_RELEASED" | "TRANSFER" | "RETURN";
  quantityChange: number;
  reason: string;
  reference?: string;
  notes?: string;
  location?: string;
  onlineStock?: number;
}

export const inventoryService = {
  getSummary: async (): Promise<InventorySummary> => {
    return unwrapApiResponse<InventorySummary>(apiClient.get("/admin/inventory/summary"));
  },

  listItems: async (
    params: ListInventoryParams = {}
  ): Promise<{ items: InventoryItem[]; total: number; page: number; limit: number }> => {
    const res = await apiClient.get("/admin/inventory/items", { params });
    const payload = res.data;
    if (!payload.success) throw new Error(payload.message || "Failed to list inventory");
    const items = Array.isArray(payload.data) ? payload.data : payload.data?.items || [];
    const total = payload.total ?? payload.data?.total ?? items.length;
    const page = payload.page ?? payload.data?.page ?? 1;
    const limit = payload.limit ?? payload.data?.limit ?? items.length;
    return { items, total, page, limit };
  },

  getItemById: async (id: string): Promise<InventoryItem> => {
    return unwrapApiResponse<InventoryItem>(apiClient.get(`/admin/inventory/items/${id}`));
  },

  createItem: async (data: CreateInventoryItemInput): Promise<InventoryItem> => {
    return unwrapApiResponse<InventoryItem>(apiClient.post("/admin/inventory/items", data));
  },

  updateItem: async (id: string, data: UpdateInventoryItemInput): Promise<InventoryItem> => {
    return unwrapApiResponse<InventoryItem>(apiClient.put(`/admin/inventory/items/${id}`, data));
  },

  adjustStock: async (id: string, data: AdjustStockInput): Promise<InventoryItem> => {
    return unwrapApiResponse<InventoryItem>(apiClient.post(`/admin/inventory/items/${id}/adjust`, data));
  },

  listMovements: async (
    params: { inventoryItemId?: string; type?: string; search?: string; page?: number; limit?: number } = {}
  ): Promise<{ movements: InventoryMovement[]; total: number; page: number; limit: number }> => {
    const res = await apiClient.get("/admin/inventory/movements", { params });
    const payload = res.data;
    if (!payload.success) throw new Error(payload.message || "Failed to list movements");
    const movements = Array.isArray(payload.data) ? payload.data : payload.data?.movements || [];
    const total = payload.total ?? payload.data?.total ?? movements.length;
    const page = payload.page ?? payload.data?.page ?? 1;
    const limit = payload.limit ?? payload.data?.limit ?? movements.length;
    return { movements, total, page, limit };
  },

  syncCatalog: async (): Promise<{ syncedCount: number }> => {
    return unwrapApiResponse<{ syncedCount: number }>(apiClient.post("/admin/inventory/sync"));
  },
};

export function useInventorySummary() {
  return useQuery<InventorySummary>({
    queryKey: ["admin", "inventory", "summary"],
    queryFn: inventoryService.getSummary,
    staleTime: 30 * 1000,
  });
}

export function useInventoryItems(params: ListInventoryParams = {}) {
  return useQuery<{ items: InventoryItem[]; total: number; page: number; limit: number }>({
    queryKey: ["admin", "inventory", "items", params],
    queryFn: () => inventoryService.listItems(params),
    staleTime: 30 * 1000,
  });
}

export function useInventoryMovements(
  params: { inventoryItemId?: string; type?: string; search?: string; page?: number; limit?: number } = {}
) {
  return useQuery<{ movements: InventoryMovement[]; total: number; page: number; limit: number }>({
    queryKey: ["admin", "inventory", "movements", params],
    queryFn: () => inventoryService.listMovements(params),
    staleTime: 30 * 1000,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInventoryItemInput) => inventoryService.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInventoryItemInput }) =>
      inventoryService.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustStockInput }) =>
      inventoryService.adjustStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
    },
  });
}

export function useSyncInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryService.syncCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
    },
  });
}
