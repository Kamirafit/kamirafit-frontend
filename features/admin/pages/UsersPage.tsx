"use client";

import { useMemo, useState } from "react";
import type { AdminUser } from "@/data/users";
import { updateUser } from "@/features/admin/store/usersSlice";
import { useAppDispatch, useAppSelector } from "@/features/product/hooks/redux";
import AdminPageHeader from "../components/AdminPageHeader";
import UserFormModal from "../components/UserFormModal";

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

  return (
    <div>
      <AdminPageHeader
        eyebrow="Community"
        title="Users"
        description="Registered customers — edit contact details kept on file."
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users…"
            className="w-full rounded-lg border border-line bg-ink-2 px-3 py-2 pl-9 text-[13px] text-paper placeholder:text-paper-muted/70 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-paper-muted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </div>
        <span className="text-[12px] text-paper-muted">
          {filtered.length} of {users.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-ink">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line text-left text-[13px]">
            <thead className="bg-ink-2/60 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-paper">
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="transition-colors hover:bg-ink-2/60"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-[12px] font-semibold text-gold">
                        {u.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium text-paper">{u.name}</span>
                        <span className="text-[11.5px] text-paper-muted">
                          {u.id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-paper-muted">{u.email}</td>
                  <td className="px-4 py-3 text-paper-muted">{u.phone}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setEditing(u)}
                        className="rounded-md border border-line px-2.5 py-1 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-paper transition-all duration-200 hover:border-gold hover:text-gold"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-paper-muted">
                    No users match your search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

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
