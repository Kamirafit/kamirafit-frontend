"use client";

import { useState } from "react";
import { MOCK_PROFILE } from "../data/mockAccount";
import { Profile } from "../types";

export default function ProfileForm() {
  const [profile, setProfile] = useState<Profile>(MOCK_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Profile>(MOCK_PROFILE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(formData);
    setIsEditing(false);
    // TODO: Send to API
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-paper-muted uppercase tracking-wider">
            First Name
          </label>
          <input
            type="text"
            required
            disabled={!isEditing}
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="rounded-lg border border-line bg-transparent px-4 py-3 text-[14px] text-paper outline-none transition-colors focus:border-gold disabled:opacity-70 disabled:bg-ink-3"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-paper-muted uppercase tracking-wider">
            Last Name
          </label>
          <input
            type="text"
            required
            disabled={!isEditing}
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="rounded-lg border border-line bg-transparent px-4 py-3 text-[14px] text-paper outline-none transition-colors focus:border-gold disabled:opacity-70 disabled:bg-ink-3"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-paper-muted uppercase tracking-wider">
            Email
          </label>
          <input
            type="email"
            required
            disabled={!isEditing}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="rounded-lg border border-line bg-transparent px-4 py-3 text-[14px] text-paper outline-none transition-colors focus:border-gold disabled:opacity-70 disabled:bg-ink-3"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-paper-muted uppercase tracking-wider">
            Mobile Number
          </label>
          <input
            type="tel"
            required
            disabled={!isEditing}
            value={formData.mobileNumber}
            onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
            className="rounded-lg border border-line bg-transparent px-4 py-3 text-[14px] text-paper outline-none transition-colors focus:border-gold disabled:opacity-70 disabled:bg-ink-3"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-medium text-paper-muted uppercase tracking-wider">
          Gender
        </label>
        <div className="flex gap-4">
          {["Male", "Female", "Other"].map((g) => (
            <label key={g} className={`flex items-center gap-2 cursor-pointer ${!isEditing ? "opacity-70 cursor-not-allowed" : ""}`}>
              <input
                type="radio"
                name="gender"
                value={g}
                disabled={!isEditing}
                checked={formData.gender === g}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="h-4 w-4 text-gold focus:ring-gold accent-gold"
              />
              <span className="text-[14px] text-paper">{g}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-4 flex gap-4 border-t border-line">
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-full bg-gold px-8 py-3 text-[12px] font-semibold uppercase tracking-wider text-white shadow-md transition-colors hover:bg-gold-bright"
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button
              type="submit"
              className="rounded-full bg-gold px-8 py-3 text-[12px] font-semibold uppercase tracking-wider text-white shadow-md transition-colors hover:bg-gold-bright"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-full border border-line px-8 py-3 text-[12px] font-semibold uppercase tracking-wider text-paper-muted transition-colors hover:border-paper hover:text-paper"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </form>
  );
}
