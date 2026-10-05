"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  useInventorySummary,
  useInventoryItems,
  useInventoryMovements,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useAdjustStock,
  useSyncInventory,
  type InventoryItem,
  type AdjustStockInput,
} from "@/services/inventory";
import AdminTableSkeleton from "@/components/skeleton/AdminTableSkeleton";
import SearchField from "../components/SearchField";
import { EmptyState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useAdminToast } from "../context/AdminToastContext";
import TableActions from "../components/TableActions";

type StatusFilter = "all" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "storefront" | "inventory_only";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function RefreshIcon({ spin }: { spin?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={spin ? "animate-spin" : ""} aria-hidden>
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
    </svg>
  );
}

export default function InventoryPage() {
  const isOnline = useOnlineStatus();
  const summaryQuery = useInventorySummary();
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const queryParams = useMemo(() => {
    return {
      search: searchQuery.trim() || undefined,
      status:
        filterStatus === "IN_STOCK" || filterStatus === "LOW_STOCK" || filterStatus === "OUT_OF_STOCK"
          ? filterStatus
          : undefined,
      storefront:
        filterStatus === "storefront" ? "true" : filterStatus === "inventory_only" ? "false" : undefined,
      page,
      limit: 10,
    };
  }, [searchQuery, filterStatus, page]);

  const itemsQuery = useInventoryItems(queryParams);
  const movementsQuery = useInventoryMovements({ limit: 40 });

  const createItemMutation = useCreateInventoryItem();
  const updateItemMutation = useUpdateInventoryItem();
  const adjustStockMutation = useAdjustStock();
  const syncCatalogMutation = useSyncInventory();

  // Modals state
  const [addStockOpen, setAddStockOpen] = useState(false);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedItemHistoryId, setSelectedItemHistoryId] = useState<string | null>(null);

  // Global admin toast
  const { showSuccess, showError } = useAdminToast();

  // Add stock form state
  const [addForm, setAddForm] = useState({
    name: "",
    sku: "",
    category: "General",
    subcategory: "",
    variantDescription: "",
    physicalStock: 10,
    onlineStock: 10,
    unitCost: 150,
    location: "Main Warehouse",
    lowStockThreshold: 5,
    isStorefrontListed: false,
    notes: "",
  });

  // Adjust stock form state
  const [adjustForm, setAdjustForm] = useState<{
    type: "STOCK_ADDED" | "DAMAGE" | "MANUAL_ADJUSTMENT" | "RESERVATION" | "RESERVATION_RELEASED" | "TRANSFER" | "RETURN";
    quantityChange: number;
    reason: string;
    reference: string;
    notes: string;
    onlineStock?: number;
  }>({
    type: "STOCK_ADDED",
    quantityChange: 10,
    reason: "New stock received",
    reference: "",
    notes: "",
  });

  // Edit item form state
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    subcategory: "",
    variantDescription: "",
    unitCost: 0,
    location: "Main Warehouse",
    lowStockThreshold: 5,
    isStorefrontListed: true,
    onlineStock: 0,
    notes: "",
  });

  const summaryData = summaryQuery.data;
  const totalPhysicalStock = summaryData?.totalPhysicalStock ?? summaryData?.physicalStockUnits ?? 0;
  const totalItems = summaryData?.totalItems ?? 0;
  const totalStockValue = summaryData?.totalStockValue ?? 0;
  const lowStockCount = summaryData?.lowStockCount ?? 0;
  const outOfStockCount = summaryData?.outOfStockCount ?? 0;
  const inStockCount = summaryData?.inStockCount ?? 0;

  const items = Array.isArray(itemsQuery.data)
    ? itemsQuery.data
    : itemsQuery.data?.items || [];
  const totalItemsCount = Array.isArray(itemsQuery.data)
    ? items.length
    : itemsQuery.data?.total ?? items.length;
  const totalPages = Math.max(1, Math.ceil(totalItemsCount / 10));

  const handleOpenAdjust = (item: InventoryItem) => {
    setAdjustItem(item);
    setAdjustForm({
      type: "STOCK_ADDED",
      quantityChange: 10,
      reason: "Stock replenishment",
      reference: "",
      notes: "",
      onlineStock: item.onlineStock,
    });
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditItem(item);
    setEditForm({
      name: item.name,
      category: item.category,
      subcategory: item.subcategory || "",
      variantDescription: item.variantDescription || "",
      unitCost: item.unitCost,
      location: item.location,
      lowStockThreshold: item.lowStockThreshold,
      isStorefrontListed: item.isStorefrontListed,
      onlineStock: item.onlineStock,
      notes: item.notes || "",
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.sku) return;
    try {
      await createItemMutation.mutateAsync({
        ...addForm,
        physicalStock: Number(addForm.physicalStock),
        onlineStock: Number(addForm.onlineStock),
        unitCost: Number(addForm.unitCost),
        lowStockThreshold: Number(addForm.lowStockThreshold),
      });
      setAddStockOpen(false);
      showSuccess(`Created inventory item "${addForm.name}".`, "Item Created");
      setAddForm({
        name: "",
        sku: "",
        category: "General",
        subcategory: "",
        variantDescription: "",
        physicalStock: 10,
        onlineStock: 10,
        unitCost: 150,
        location: "Main Warehouse",
        lowStockThreshold: 5,
        isStorefrontListed: false,
        notes: "",
      });
    } catch (err: unknown) {
      showError((err as Error).message || "Failed to create inventory item", "Creation Failed");
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;
    try {
      await adjustStockMutation.mutateAsync({
        id: adjustItem.id,
        data: {
          ...adjustForm,
          quantityChange: Number(adjustForm.quantityChange),
          onlineStock: adjustForm.onlineStock !== undefined ? Number(adjustForm.onlineStock) : undefined,
        },
      });
      showSuccess(
        `Stock adjusted for "${adjustItem.name}" (${adjustForm.quantityChange > 0 ? "+" : ""}${adjustForm.quantityChange} units).`,
        "Stock Adjusted"
      );
      setAdjustItem(null);
    } catch (err: unknown) {
      showError((err as Error).message || "Failed to adjust stock", "Adjustment Failed");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    try {
      await updateItemMutation.mutateAsync({
        id: editItem.id,
        data: {
          ...editForm,
          unitCost: Number(editForm.unitCost),
          lowStockThreshold: Number(editForm.lowStockThreshold),
          onlineStock: Number(editForm.onlineStock),
        },
      });
      showSuccess(`Inventory record for "${editItem.name}" updated.`, "Item Updated");
      setEditItem(null);
    } catch (err: unknown) {
      showError((err as Error).message || "Failed to update item", "Update Failed");
    }
  };

  const handleSyncCatalog = async () => {
    try {
      const res = await syncCatalogMutation.mutateAsync();
      showSuccess(
        `Catalog sync complete! Linked ${res.syncedCount} new variant(s) to digital inventory.`,
        "Catalog Synchronized"
      );
    } catch (err: unknown) {
      showError((err as Error).message || "Catalog sync failed", "Sync Failed");
    }
  };

  const filteredMovements = useMemo(() => {
    const raw = movementsQuery.data;
    const all = Array.isArray(raw) ? raw : raw?.movements || [];
    if (!selectedItemHistoryId) return all;
    return all.filter((m) => m.inventoryItemId === selectedItemHistoryId);
  }, [movementsQuery.data, selectedItemHistoryId]);

  if (!isOnline) {
    return <OfflineState onRetry={() => itemsQuery.refetch()} />;
  }

  return (
    <div className="space-y-6">

      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          eyebrow="Digital Warehouse & Stock Control"
          title="Inventory Management"
          description="Manage company-owned physical stock, track warehouse quantities, and govern storefront visibility."
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSyncCatalog}
            disabled={syncCatalogMutation.isPending}
            className="flex items-center gap-1.5"
          >
            <RefreshIcon spin={syncCatalogMutation.isPending} />
            {syncCatalogMutation.isPending ? "Syncing..." : "Sync Catalog"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedItemHistoryId(null);
              setHistoryOpen(true);
            }}
            className="flex items-center gap-1.5"
          >
            <HistoryIcon />
            Stock History
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setAddStockOpen(true)}
            className="flex items-center gap-1.5"
          >
            <PlusIcon />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Top-Level KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-line bg-ink-2/60 p-4 shadow-sm backdrop-blur-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted">Total Items</p>
          <p className="mt-1 font-display text-2xl font-bold text-paper">{totalItems}</p>
          <p className="mt-0.5 text-[11px] text-paper-muted">Distinct SKUs tracked</p>
        </div>
        <div className="rounded-xl border border-line bg-ink-2/60 p-4 shadow-sm backdrop-blur-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted">Physical Stock</p>
          <p className="mt-1 font-display text-2xl font-bold text-paper">{(totalPhysicalStock ?? 0).toLocaleString()}</p>
          <p className="mt-0.5 text-[11px] text-paper-muted">Total units owned</p>
        </div>
        <div className="rounded-xl border border-line bg-ink-2/60 p-4 shadow-sm backdrop-blur-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted">Stock Value</p>
          <p className="mt-1 font-display text-2xl font-bold text-gold">{formatCurrency(totalStockValue)}</p>
          <p className="mt-0.5 text-[11px] text-paper-muted">Valued at unit cost price</p>
        </div>
        <div className="rounded-xl border border-line bg-ink-2/60 p-4 shadow-sm backdrop-blur-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">Low Stock</p>
          <p className="mt-1 font-display text-2xl font-bold text-amber-800">{lowStockCount}</p>
          <p className="mt-0.5 text-[11px] text-paper-muted">At or below alert threshold</p>
        </div>
        <div className="rounded-xl border border-line bg-ink-2/60 p-4 shadow-sm backdrop-blur-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#B3261E]">Out of Stock</p>
          <p className="mt-1 font-display text-2xl font-bold text-[#B3261E]">{outOfStockCount}</p>
          <p className="mt-0.5 text-[11px] text-paper-muted">Zero units remaining</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-ink-2/40 p-3.5 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setFilterStatus("all");
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
              filterStatus === "all" ? "bg-gold text-ink" : "bg-ink-3 text-paper-muted hover:text-paper"
            }`}
          >
            All Stock ({totalItems})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterStatus("IN_STOCK");
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
              filterStatus === "IN_STOCK" ? "bg-emerald-500/15 text-emerald-700 border border-emerald-600/30" : "bg-ink-3 text-paper-muted hover:text-paper"
            }`}
          >
            In Stock ({inStockCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterStatus("LOW_STOCK");
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
              filterStatus === "LOW_STOCK" ? "bg-amber-500/15 text-amber-800 border border-amber-600/30" : "bg-ink-3 text-paper-muted hover:text-paper"
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterStatus("OUT_OF_STOCK");
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
              filterStatus === "OUT_OF_STOCK" ? "bg-red-500/15 text-[#B3261E] border border-red-600/30" : "bg-ink-3 text-paper-muted hover:text-paper"
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterStatus("storefront");
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
              filterStatus === "storefront" ? "bg-blue-500/15 text-blue-700 border border-blue-600/30" : "bg-ink-3 text-paper-muted hover:text-paper"
            }`}
          >
            Listed Online
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterStatus("inventory_only");
              setPage(1);
            }}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
              filterStatus === "inventory_only" ? "bg-purple-500/15 text-purple-700 border border-purple-600/30" : "bg-ink-3 text-paper-muted hover:text-paper"
            }`}
          >
            Not Listed Online
          </button>
        </div>

        <div className="w-full md:w-64">
          <SearchField
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setPage(1);
            }}
            placeholder="Search SKU or item..."
          />
        </div>
      </div>

      {/* Main Stock Table */}
      {itemsQuery.isLoading ? (
        <AdminTableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          title="No inventory records found"
          description={searchQuery ? "No stock items match your search filter." : "Start by clicking 'Add Stock' or 'Sync Catalog'."}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-ink-2/40 shadow-sm">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="min-w-[1000px] w-full text-left text-sm divide-y divide-line">
              <thead className="border-b border-line bg-ink-3/60 text-[11px] uppercase tracking-wider text-paper-muted">
                <tr>
                  <th className="px-4 py-3.5 whitespace-nowrap min-w-[280px]">Item & SKU</th>
                  <th className="px-4 py-3.5 whitespace-nowrap min-w-[140px]">Category</th>
                  <th className="px-4 py-3.5 text-right whitespace-nowrap min-w-[100px]">Available</th>
                  <th className="px-4 py-3.5 text-center whitespace-nowrap min-w-[90px]">Online</th>
                  <th className="px-4 py-3.5 text-right whitespace-nowrap min-w-[95px]">Unit Cost</th>
                  <th className="px-4 py-3.5 text-right whitespace-nowrap min-w-[105px]">Stock Value</th>
                  <th className="px-4 py-3.5 text-center whitespace-nowrap min-w-[125px]">Status</th>
                  <th className="px-4 py-3.5 text-right whitespace-nowrap min-w-[70px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-white/[0.04]">
                    <td className="px-4 py-3.5 min-w-[280px]">
                      <div className="font-semibold text-paper leading-snug">{item.name}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-paper-muted">
                        <span className="font-mono text-[11px] font-semibold text-gold bg-gold/5 px-1.5 py-0.5 rounded border border-gold/15 whitespace-nowrap">
                          {item.sku}
                        </span>
                        {item.variantDescription && (
                          <span className="inline-flex items-center text-paper-muted/80 whitespace-nowrap">
                            <span className="mr-1 text-paper-muted/40">•</span>
                            <span>{item.variantDescription}</span>
                          </span>
                        )}
                        {item.location && (
                          <span className="text-[10.5px] text-paper-muted/60 whitespace-nowrap">
                            ({item.location})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-ink-3 px-2.5 py-0.5 text-[11px] font-medium text-paper whitespace-nowrap">
                        {item.category}
                        {item.subcategory ? ` / ${item.subcategory}` : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap font-medium text-paper">
                      {(item.availableStock ?? 0).toLocaleString()}
                      {(item.reservedStock ?? 0) > 0 && (
                        <span className="ml-1 text-[11px] font-semibold text-amber-800">({item.reservedStock} res)</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      {item.isStorefrontListed ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-600/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          True
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-paper-muted/30 bg-ink-3 px-2.5 py-0.5 text-[11px] font-semibold text-paper-muted">
                          <span className="h-1.5 w-1.5 rounded-full bg-paper-muted/60" />
                          False
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap text-paper-muted">
                      {formatCurrency(item.unitCost)}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap font-semibold text-gold">
                      {formatCurrency(item.stockValue)}
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      {item.status === "IN_STOCK" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-600/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700 whitespace-nowrap">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          In Stock
                        </span>
                      ) : item.status === "LOW_STOCK" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-600/30 bg-amber-600/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-amber-800 whitespace-nowrap">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B3261E]/30 bg-[#B3261E]/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#B3261E] whitespace-nowrap">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#B3261E]" />
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end">
                        <TableActions
                          actions={[
                            {
                              label: "Adjust stock",
                              onClick: () => handleOpenAdjust(item),
                              icon: (
                                <svg className="h-3.5 w-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                                </svg>
                              ),
                            },
                            {
                              label: "Edit details",
                              onClick: () => handleOpenEdit(item),
                              icon: (
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              ),
                            },
                            {
                              label: "Stock history",
                              onClick: () => {
                                setSelectedItemHistoryId(item.id);
                                setHistoryOpen(true);
                              },
                              icon: (
                                <svg className="h-3.5 w-3.5 text-paper-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                              ),
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls - 10 items per page */}
          <div className="flex flex-col gap-3 border-t border-line bg-ink-2/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between text-xs text-paper-muted">
            <div>
              Showing{" "}
              <span className="font-semibold text-paper">
                {totalItemsCount === 0 ? 0 : (page - 1) * 10 + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-paper">
                {Math.min(page * 10, totalItemsCount)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-paper">
                {totalItemsCount}
              </span>{" "}
              items
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex items-center gap-1 rounded-lg border border-line bg-ink-3 px-3 py-1.5 text-xs font-semibold text-paper transition-colors hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink-3 disabled:hover:text-paper"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
                    })
                    .map((p, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && p - prevPage > 1;
                      return (
                        <div key={p} className="flex items-center">
                          {showEllipsis && <span className="px-1 text-paper-muted">…</span>}
                          <button
                            type="button"
                            onClick={() => setPage(p)}
                            className={`h-7 min-w-[28px] rounded-lg px-2 text-xs font-semibold transition-colors ${
                              page === p
                                ? "bg-gold text-ink"
                                : "bg-ink-3 text-paper hover:bg-gold/20"
                            }`}
                          >
                            {p}
                          </button>
                        </div>
                      );
                    })}
                </div>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex items-center gap-1 rounded-lg border border-line bg-ink-3 px-3 py-1.5 text-xs font-semibold text-paper transition-colors hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink-3 disabled:hover:text-paper"
                >
                  Next
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {addStockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-ink p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-paper">Add Digital Stock</h3>
            <p className="mt-1 text-xs text-paper-muted">
              Record physical items owned by KamiraFit. You can choose whether this item is listed on the storefront.
            </p>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-paper-muted">Item / Product Name *</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Black Oversized Tee or Raw Cotton Fabric"
                  className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-paper-muted">SKU / Internal Code *</label>
                  <input
                    type="text"
                    required
                    value={addForm.sku}
                    onChange={(e) => setAddForm({ ...addForm, sku: e.target.value.toUpperCase() })}
                    placeholder="e.g. KF-TEE-BLK-M"
                    className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm font-mono text-paper focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-paper-muted">Category *</label>
                  <input
                    type="text"
                    required
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    placeholder="e.g. T-Shirts or Raw Materials"
                    className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-paper-muted">Subcategory</label>
                  <input
                    type="text"
                    value={addForm.subcategory}
                    onChange={(e) => setAddForm({ ...addForm, subcategory: e.target.value })}
                    placeholder="e.g. Oversized"
                    className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-paper-muted">Variant Description</label>
                  <input
                    type="text"
                    value={addForm.variantDescription}
                    onChange={(e) => setAddForm({ ...addForm, variantDescription: e.target.value })}
                    placeholder="e.g. Size M / Jet Black"
                    className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-paper-muted">Physical Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={addForm.physicalStock}
                    onChange={(e) => setAddForm({ ...addForm, physicalStock: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-paper-muted">Online Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.onlineStock}
                    onChange={(e) => setAddForm({ ...addForm, onlineStock: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-paper-muted">Unit Cost (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={addForm.unitCost}
                    onChange={(e) => setAddForm({ ...addForm, unitCost: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-paper-muted">Warehouse Location</label>
                  <input
                    type="text"
                    value={addForm.location}
                    onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-paper-muted">Low Stock Alert Level</label>
                  <input
                    type="number"
                    min="1"
                    value={addForm.lowStockThreshold}
                    onChange={(e) => setAddForm({ ...addForm, lowStockThreshold: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-line bg-ink-2 p-3">
                <input
                  type="checkbox"
                  id="isStorefrontListed"
                  checked={addForm.isStorefrontListed}
                  onChange={(e) => setAddForm({ ...addForm, isStorefrontListed: e.target.checked })}
                  className="h-4 w-4 rounded border-line bg-ink text-gold focus:ring-gold"
                />
                <label htmlFor="isStorefrontListed" className="text-xs text-paper">
                  <span className="font-semibold">Listed on Public Storefront</span>
                  <p className="text-[11px] text-paper-muted">Uncheck if this is inventory-only stock (not sold on website)</p>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-paper-muted">Notes / Memo</label>
                <textarea
                  rows={2}
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  placeholder="Batch numbers, supplier details, warehouse rack..."
                  className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setAddStockOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={createItemMutation.isPending}
                >
                  {createItemMutation.isPending ? "Adding..." : "Save Stock Item"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-line bg-ink p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-paper">Adjust Physical Stock</h3>
            <p className="mt-1 text-xs text-paper-muted">
              {adjustItem.name} — <span className="font-mono text-gold">{adjustItem.sku}</span>
            </p>
            <div className="mt-3 flex items-center gap-4 rounded-lg bg-ink-2 p-3 text-xs">
              <div>
                <span className="text-paper-muted">Current Physical:</span>{" "}
                <span className="font-bold text-paper">{adjustItem.physicalStock}</span>
              </div>
              <div>
                <span className="text-paper-muted">Online Available:</span>{" "}
                <span className="font-bold text-paper">{adjustItem.onlineStock}</span>
              </div>
            </div>

            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-paper-muted">Movement Type *</label>
                <select
                  value={adjustForm.type}
                  onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value as AdjustStockInput["type"] })}
                  className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                >
                  <option value="STOCK_ADDED">Stock Added (Receiving / Restock)</option>
                  <option value="DAMAGE">Damaged / Written Off</option>
                  <option value="MANUAL_ADJUSTMENT">Manual Stock Count Correction</option>
                  <option value="RETURN">Customer Return Restock</option>
                  <option value="TRANSFER">Internal Warehouse Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-paper-muted">
                  Quantity Change * (positive to add, negative to deduct)
                </label>
                <input
                  type="number"
                  required
                  value={adjustForm.quantityChange}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantityChange: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-paper-muted">
                  New physical stock will be:{" "}
                  <span className="font-bold text-gold">
                    {Math.max(0, adjustItem.physicalStock + Number(adjustForm.quantityChange))} units
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-paper-muted">Reason / Explanation *</label>
                <input
                  type="text"
                  required
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  placeholder="e.g. Received new shipment from Surat mill"
                  className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-paper-muted">Reference / Invoice #</label>
                <input
                  type="text"
                  value={adjustForm.reference}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reference: e.target.value })}
                  placeholder="e.g. PO-8921 or RETURN-104"
                  className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setAdjustItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={adjustStockMutation.isPending}
                >
                  {adjustStockMutation.isPending ? "Applying..." : "Confirm Adjustment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-line bg-ink p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-paper">Edit Inventory Record</h3>
            <p className="mt-1 text-xs text-paper-muted">
              SKU: <span className="font-mono text-gold">{editItem.sku}</span>
            </p>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-paper-muted">Item Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-paper-muted">Unit Cost (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.unitCost}
                    onChange={(e) => setEditForm({ ...editForm, unitCost: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-paper-muted">Low Stock Alert *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editForm.lowStockThreshold}
                    onChange={(e) => setEditForm({ ...editForm, lowStockThreshold: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-paper-muted">Online Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.onlineStock}
                    onChange={(e) => setEditForm({ ...editForm, onlineStock: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-paper-muted">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-line bg-ink-2 p-3">
                <input
                  type="checkbox"
                  id="editIsStorefrontListed"
                  checked={editForm.isStorefrontListed}
                  onChange={(e) => setEditForm({ ...editForm, isStorefrontListed: e.target.checked })}
                  className="h-4 w-4 rounded border-line bg-ink text-gold focus:ring-gold"
                />
                <label htmlFor="editIsStorefrontListed" className="text-xs text-paper">
                  <span className="font-semibold">Listed on Public Storefront</span>
                  <p className="text-[11px] text-paper-muted">When unchecked, this item will never appear on the storefront</p>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-paper-muted">Notes</label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-gold focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={updateItemMutation.isPending}
                >
                  {updateItemMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock History Modal */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-ink p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-paper">Stock Movement History</h3>
                <p className="text-xs text-paper-muted">
                  {selectedItemHistoryId
                    ? "Audit trail for selected inventory item"
                    : "Complete real-time audit log of stock entries, sales, cancellations, and adjustments"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryOpen(false)}
                className="rounded-lg border border-line bg-ink-2 p-1.5 text-paper-muted hover:text-paper"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 divide-y divide-line/60">
              {filteredMovements.length === 0 ? (
                <p className="py-8 text-center text-sm text-paper-muted">No stock movements recorded yet.</p>
              ) : (
                filteredMovements.map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            m.quantityChange > 0
                              ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                              : "bg-red-500/10 text-[#B3261E] border border-red-500/20"
                          }`}
                        >
                          {m.type}
                        </span>
                        <span className="font-semibold text-paper text-sm">
                          {m.itemName || "Item"}
                        </span>
                        {m.itemSku && (
                          <span className="font-mono text-xs text-gold/80">({m.itemSku})</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-paper-muted">
                        {m.reason || "Stock change"}{" "}
                        {m.reference && <span className="text-paper">• Ref: {m.reference}</span>}
                      </p>
                      <p className="mt-0.5 text-[10px] text-paper-muted/60">
                        By {m.createdBy || "System"} on {m.createdAt ? new Date(m.createdAt).toLocaleString("en-IN") : "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-mono text-base font-bold ${
                          m.quantityChange > 0 ? "text-emerald-700" : "text-[#B3261E]"
                        }`}
                      >
                        {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                      </div>
                      <div className="text-[11px] text-paper-muted">
                        {m.previousStock} → <span className="text-paper font-semibold">{m.newStock}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
