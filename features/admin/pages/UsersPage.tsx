"use client";

import { useMemo, useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import type { AdminUser } from "@/data/users";
import { updateUser } from "@/features/admin/store/usersSlice";
import { useAppDispatch, useAppSelector } from "@/features/product/hooks/redux";
import ActionButton from "../components/ActionButton";
import DataTable, { type Column } from "../components/DataTable";
import SearchField from "../components/SearchField";
import UserFormModal from "../components/UserFormModal";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const users = useAppSelector((s) => s.adminUsers.items);

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

      <DataTable
        columns={columns}
        rows={filtered}
        getRowKey={(u) => u.id}
        emptyLabel="No users match your search."
      />

      <UserFormModal
        open={editing !== null}
        initial={editing}
        onClose={() => setEditing(null)}
        onSubmit={(values) => {
          if (editing) {
            dispatch(updateUser({ id: editing.id, patch: values }));
          }
          setEditing(null);
        }}
      />
    </div>
  );
}
