"use client";

import { useMemo, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { AdminUser } from "@/types/entities";
import { useAdminUsers, useUpdateAdminUser } from "@/services/admin";
import AdminTableSkeleton from "@/components/skeleton/AdminTableSkeleton";
import ActionButton from "../components/ActionButton";
import DataTable, { type Column } from "../components/DataTable";
import SearchField from "../components/SearchField";
import UserFormModal from "../components/UserFormModal";
import { EmptyState, ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export default function UsersPage() {
  const usersQuery = useAdminUsers();
  const { data: users = [], isLoading } = usersQuery;
  const isOnline = useOnlineStatus();
  const updateMutation = useUpdateAdminUser();

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AdminUser | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q),
    );
  }, [users, query]);

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      label: "Name",
      render: (u) => (
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-[12px] font-semibold uppercase tracking-[0.08em] text-gold">
            {initials(u.name)}
          </span>
          <div className="flex flex-col">
            <span className="font-medium text-paper">{u.name}</span>
            <span className="text-[11.5px] text-paper-muted">{u.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (u) => <span className="text-paper-muted">{u.email}</span>,
    },
    {
      key: "phone",
      label: "Phone",
      render: (u) => <span className="text-paper-muted">{u.phone}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (u) => (
        <div className="flex items-center justify-end">
          <ActionButton onClick={() => setEditing(u)}>Edit</ActionButton>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Community"
        title="Users"
        description="Registered customers — edit contact details kept on file."
      />

      <div className="flex items-center gap-3">
        <div className="w-full sm:max-w-xs">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search users…"
            label="Search users"
          />
        </div>
        <span className="text-[12px] text-paper-muted">
          {filtered.length} of {users.length}
        </span>
      </div>

      {!isOnline && users.length === 0 ? (
        <OfflineState onRetry={() => void usersQuery.refetch()} />
      ) : isLoading ? (
        <AdminTableSkeleton />
      ) : usersQuery.isError ? (
        <ErrorState message="We couldn’t load customers." onRetry={() => void usersQuery.refetch()} />
      ) : users.length === 0 ? (
        <EmptyState title="No customers yet" description="Registered customers will appear here." />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(u) => u.id}
          emptyLabel="No users match your search."
        />
      )}

      {updateMutation.isError ? <ErrorState className="min-h-0 py-6" title="Customer not updated" message="Please try saving those changes again." /> : null}

      <UserFormModal
        open={editing !== null}
        initial={editing}
        onClose={() => setEditing(null)}
        onSubmit={(values) => {
          if (editing) {
            updateMutation.mutate({ id: editing.id, patch: values });
          }
          setEditing(null);
        }}
      />
    </div>
  );
}
