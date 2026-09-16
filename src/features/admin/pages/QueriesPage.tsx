"use client";

import { useMemo, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { ContactQuery, AdminQueryInput } from "@/types/entities";
import {
  useAdminQueries,
  useCreateAdminQuery,
  useUpdateAdminQuery,
} from "@/services/admin";
import Button from "@/components/ui/Button";
import AdminTableSkeleton from "@/components/skeleton/AdminTableSkeleton";
import TableActions from "../components/TableActions";
import DataTable, { type Column } from "../components/DataTable";
import SearchField from "../components/SearchField";
import QueryDetailsModal from "../components/QueryDetailsModal";
import QueryFormModal from "../components/QueryFormModal";
import { EmptyState } from "@/components/states";

export default function QueriesPage() {
  const queriesQuery = useAdminQueries();
  const createQueryMutation = useCreateAdminQuery();
  const updateQueryMutation = useUpdateAdminQuery();

  const { data: queries = [] } = queriesQuery;
  const isLoading = queriesQuery.isLoading || queriesQuery.isFetching;

  const [queryText, setQueryText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "PENDING" | "RESOLVED">("ALL");
  const [activeQuery, setActiveQuery] = useState<ContactQuery | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingQuery, setEditingQuery] = useState<ContactQuery | null>(null);


  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return queries.filter((item) => {
      const matchesStatus =
        selectedStatus === "ALL" ? true : item.status === selectedStatus;

      const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
      const matchesSearch =
        !q ||
        fullName.includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.phone.includes(q) ||
        item.message.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [queries, queryText, selectedStatus]);

  const pendingCount = useMemo(
    () => queries.filter((q) => q.status === "PENDING").length,
    [queries]
  );
  const resolvedCount = useMemo(
    () => queries.filter((q) => q.status === "RESOLVED").length,
    [queries]
  );

  const columns: Column<ContactQuery>[] = [
    {
      key: "name",
      label: "Customer",
      render: (item) => {
        const fullName = `${item.firstName} ${item.lastName}`.trim();
        return (
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-[13px] font-semibold text-gold ring-1 ring-gold/20">
              {item.firstName[0]?.toUpperCase() || "C"}
            </span>
            <div className="flex flex-col">
              <span className="font-medium text-paper">{fullName}</span>
              <span className="text-[11px] text-paper-muted">{item.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "phone",
      label: "Phone",
      render: (item) => (
        <span className="text-xs text-paper-muted">
          {item.countryCode} {item.phone}
        </span>
      ),
    },
    {
      key: "message",
      label: "Message Preview",
      render: (item) => (
        <p className="max-w-xs truncate text-xs text-paper-muted" title={item.message}>
          {item.message}
        </p>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            item.status === "RESOLVED"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              item.status === "RESOLVED" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
            }`}
          />
          {item.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Received",
      render: (item) => (
        <span className="text-xs text-paper-muted">
          {new Date(item.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (item) => (
        <TableActions
          actions={[
            {
              label: "View Details",
              onClick: () => setActiveQuery(item),
              icon: (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ),
            },
            {
              label: "Edit",
              onClick: () => {
                setEditingQuery(item);
                setFormModalOpen(true);
              },
              icon: (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              ),
            },
          ]}
        />
      ),
    },
  ];

  const handleFormSubmit = async (values: AdminQueryInput) => {
    if (editingQuery) {
      await updateQueryMutation.mutateAsync({
        id: editingQuery.id,
        data: values,
      });
    } else {
      await createQueryMutation.mutateAsync(values);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          eyebrow="Inquiries"
          title="Customer Queries"
          description="Inquiries received from the Contact Us form on the website."
        />

        {/* Quick summary counters and Add Query CTA */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-line bg-ink-2/60 px-3.5 py-2 text-center">
              <span className="block text-xs font-bold text-amber-400">{pendingCount}</span>
              <span className="text-[10px] uppercase tracking-wider text-paper-muted">Pending</span>
            </div>
            <div className="rounded-xl border border-line bg-ink-2/60 px-3.5 py-2 text-center">
              <span className="block text-xs font-bold text-emerald-400">{resolvedCount}</span>
              <span className="text-[10px] uppercase tracking-wider text-paper-muted">Resolved</span>
            </div>
            <div className="rounded-xl border border-line bg-ink-2/60 px-3.5 py-2 text-center">
              <span className="block text-xs font-bold text-paper">{queries.length}</span>
              <span className="text-[10px] uppercase tracking-wider text-paper-muted">Total</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => {
              setEditingQuery(null);
              setFormModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <span className="text-base leading-none font-bold">+</span>
            <span>Add Query</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="w-full sm:max-w-xs">
          <SearchField
            value={queryText}
            onChange={setQueryText}
            placeholder="Search queries by name, email, phone…"
            label="Search queries"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 rounded-full border border-line bg-ink-2/40 p-1">
          {(["ALL", "PENDING", "RESOLVED"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                selectedStatus === status
                  ? "bg-gold text-ink font-bold shadow-sm"
                  : "text-paper-muted hover:text-paper"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Query List / Table */}
      {isLoading ? (
        <AdminTableSkeleton />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-ink-2/30 p-12 text-center">
          <EmptyState
            title="No Queries Found"
            description={
              queryText || selectedStatus !== "ALL"
                ? "No customer inquiries matched your current search or status filters."
                : "No customer queries have been submitted yet."
            }
          />
        </div>
      ) : (
        <DataTable<ContactQuery>
          columns={columns}
          rows={filtered}
          getRowKey={(item) => item.id}
        />
      )}

      {/* Query Details Modal */}
      {activeQuery && (
        <QueryDetailsModal
          query={queries.find((q) => q.id === activeQuery.id) || activeQuery}
          onClose={() => setActiveQuery(null)}
          onEdit={(q) => {
            setEditingQuery(q);
            setFormModalOpen(true);
          }}
        />
      )}

      {/* Add / Edit Query Modal */}
      <QueryFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingQuery(null);
        }}
        onSubmit={handleFormSubmit}
        initial={editingQuery}
        loading={createQueryMutation.isPending || updateQueryMutation.isPending}
      />
    </div>
  );
}

