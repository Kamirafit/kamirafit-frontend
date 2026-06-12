import { Address } from "../types";

type Props = {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
};

export default function AddressCard({ address, onEdit, onDelete, onSetDefault }: Props) {
  return (
    <div className="relative flex flex-col rounded-2xl border border-line bg-ink p-5 shadow-sm transition-all duration-300 hover:border-gold/40 hover:shadow-md">
      {address.isDefault && (
        <span className="absolute right-5 top-5 inline-flex rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold">
          Default
        </span>
      )}
      <div className="flex items-center gap-2">
        <span className="inline-flex rounded bg-ink-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-paper-muted">
          {address.type}
        </span>
      </div>

      <div className="mt-4 flex-1">
        <p className="font-display text-[15px] font-semibold text-paper">
          {address.fullName}
        </p>
        <p className="mt-1 text-sm text-paper-muted">
          {address.phoneNumber}
        </p>
        <div className="mt-3 text-sm leading-relaxed text-paper-muted">
          <p>{address.addressLine1}</p>
          {address.addressLine2 && <p>{address.addressLine2}</p>}
          {address.landmark && <p>Landmark: {address.landmark}</p>}
          <p>
            {address.city}, {address.state} - {address.pincode}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <button
          onClick={() => onEdit(address)}
          className="text-[12px] font-semibold uppercase tracking-wider text-gold transition-colors hover:text-gold-bright"
        >
          Edit
        </button>
        <span className="text-line">|</span>
        <button
          onClick={() => onDelete(address.id)}
          className="text-[12px] font-semibold uppercase tracking-wider text-[#DC2626] transition-colors hover:text-[#B91C1C]"
        >
          Remove
        </button>
        {!address.isDefault && (
          <>
            <span className="text-line">|</span>
            <button
              onClick={() => onSetDefault(address.id)}
              className="text-[12px] font-semibold uppercase tracking-wider text-paper-muted transition-colors hover:text-paper"
            >
              Set as Default
            </button>
          </>
        )}
      </div>
    </div>
  );
}
