import ProfileForm from "@/features/account/components/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="rounded-2xl border border-line bg-ink p-6 shadow-sm sm:p-8">
      <h1 className="font-display text-2xl font-bold text-paper">
        Profile Information
      </h1>
      <div className="mt-8">
        <ProfileForm />
      </div>
    </div>
  );
}
