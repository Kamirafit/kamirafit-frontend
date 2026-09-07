"use client";

import { useState, useEffect } from "react";
import { Profile } from "../types";
import { useProfile, useUpdateProfile } from "@/features/auth/hooks";
import ProfileSkeleton from "@/components/skeleton/ProfileSkeleton";
import { ErrorState, OfflineState } from "@/components/states";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import Button from "@/components/ui/Button";
import { COUNTRY_CODES } from "@/data/countryCodes";

export default function ProfileForm() {
  const { data: serverProfile, isLoading, isError, refetch } = useProfile();
  const isOnline = useOnlineStatus();
  const updateMutation = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState<Profile>({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+91",
    phoneNumber: "",
    gender: "male",
  });

  useEffect(() => {
    if (serverProfile) {
      setFormData({
        ...serverProfile,
        countryCode: serverProfile.countryCode || "+91",
        phoneNumber: serverProfile.phoneNumber || serverProfile.mobileNumber?.replace(/^\+\d+\s*/, "") || "",
        gender: (serverProfile.gender || "male").toLowerCase(),
      });
    }
  }, [serverProfile]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    try {
      await updateMutation.mutateAsync({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        countryCode: formData.countryCode || "+91",
        phoneNumber: formData.phoneNumber || "",
        gender: formData.gender?.toLowerCase() || "male",
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch {
      // Error handled by mutation state
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (serverProfile) {
      setFormData({
        ...serverProfile,
        countryCode: serverProfile.countryCode || "+91",
        phoneNumber: serverProfile.phoneNumber || serverProfile.mobileNumber?.replace(/^\+\d+\s*/, "") || "",
        gender: (serverProfile.gender || "male").toLowerCase(),
      });
    }
    setIsEditing(false);
  };

  if (!isOnline && !serverProfile) {
    return <OfflineState onRetry={() => void refetch()} />;
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError || !serverProfile) {
    return <ErrorState message="We couldn’t load your profile." onRetry={() => void refetch()} />;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
      {saveSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          Profile updated successfully.
        </div>
      )}
      {updateMutation.isError ? (
        <ErrorState
          className="min-h-0 py-6"
          title="Changes weren’t saved"
          message="Please check your connection and try saving again."
        />
      ) : null}

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
            className={`rounded-lg border px-4 py-3 text-[14px] text-paper outline-none transition-colors ${
              isEditing
                ? "border-gold/60 bg-ink-2 focus:border-gold focus:ring-1 focus:ring-gold/30"
                : "border-line bg-ink-3/40 opacity-75 cursor-default"
            }`}
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
            className={`rounded-lg border px-4 py-3 text-[14px] text-paper outline-none transition-colors ${
              isEditing
                ? "border-gold/60 bg-ink-2 focus:border-gold focus:ring-1 focus:ring-gold/30"
                : "border-line bg-ink-3/40 opacity-75 cursor-default"
            }`}
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
            className={`rounded-lg border px-4 py-3 text-[14px] text-paper outline-none transition-colors ${
              isEditing
                ? "border-gold/60 bg-ink-2 focus:border-gold focus:ring-1 focus:ring-gold/30"
                : "border-line bg-ink-3/40 opacity-75 cursor-default"
            }`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-paper-muted uppercase tracking-wider">
            Phone Number
          </label>
          <div className="flex gap-2">
            <select
              disabled={!isEditing}
              value={formData.countryCode || "+91"}
              onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
              className={`w-36 sm:w-44 rounded-lg border px-3 py-3 text-[13px] text-paper outline-none transition-colors ${
                isEditing
                  ? "border-gold/60 bg-ink-2 focus:border-gold focus:ring-1 focus:ring-gold/30 cursor-pointer"
                  : "border-line bg-ink-3/40 opacity-75 cursor-default"
              }`}
            >
              {COUNTRY_CODES.map((item) => (
                <option key={`${item.name}-${item.code}`} value={item.code} className="bg-ink text-paper">
                  {item.label}
                </option>
              ))}
            </select>
            <input
              type="tel"
              required
              disabled={!isEditing}
              value={formData.phoneNumber || ""}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className={`flex-1 rounded-lg border px-4 py-3 text-[14px] text-paper outline-none transition-colors ${
                isEditing
                  ? "border-gold/60 bg-ink-2 focus:border-gold focus:ring-1 focus:ring-gold/30"
                  : "border-line bg-ink-3/40 opacity-75 cursor-default"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[12px] font-medium text-paper-muted uppercase tracking-wider">
          Gender
        </label>
        <div className="flex gap-4">
          {[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
            { label: "Other", value: "other" },
          ].map(({ label, value }) => (
            <label
              key={value}
              className={`flex items-center gap-2 cursor-pointer ${
                !isEditing ? "opacity-75 cursor-default" : ""
              }`}
            >
              <input
                type="radio"
                name="gender"
                value={value}
                disabled={!isEditing}
                checked={(formData.gender || "").toLowerCase() === value}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="h-4 w-4 text-gold focus:ring-gold accent-gold"
              />
              <span className="text-[14px] text-paper">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-4 flex gap-4 border-t border-line">
        {!isEditing ? (
          <Button
            type="button"
            variant="primary"
            onClick={handleStartEdit}
          >
            Edit Profile
          </Button>
        ) : (
          <>
            <Button
              type="submit"
              variant="primary"
              loading={updateMutation.isPending}
              loadingText="Saving Changes..."
            >
              Save Changes
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={updateMutation.isPending}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
