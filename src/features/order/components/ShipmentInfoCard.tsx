"use client";

type ShipmentInfoCardProps = {
  courierName?: string | null;
  trackingCode?: string | null;
  estimatedDelivery?: string | null;
  orderStatus?: string;
  onTrack?: () => void;
};

export default function ShipmentInfoCard({
  courierName,
  trackingCode,
  estimatedDelivery,
  orderStatus = "Confirmed",
  onTrack,
}: ShipmentInfoCardProps) {
  // If no tracking code or courier information is available yet, provide a reassuring note
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col justify-between border border-outline-variant/30">
      <div>
        <div className="flex items-center gap-2 mb-3 text-surface-tint">
          <svg className="w-5 h-5 text-surface-tint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-surface-tint">
            Shipment Dispatch
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
          <h3 className="font-display text-xl sm:text-2xl text-primary font-medium">
            {estimatedDelivery ? `Expected by ${estimatedDelivery}` : "Dispatched in 24–48 Hours"}
          </h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-container text-primary w-fit border border-outline-variant/30">
            {orderStatus}
          </span>
        </div>

        <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          {courierName ? (
            <>
              Partnered courier: <span className="font-medium text-primary">{courierName}</span>
              {trackingCode && (
                <>
                  {" "}
                  • AWB: <span className="font-mono text-xs text-primary">{trackingCode}</span>
                </>
              )}
            </>
          ) : (
            "Every order is carefully checked before dispatch. You will receive an SMS and email notification with your live courier tracking link as soon as your package ships."
          )}
        </p>
      </div>

      {onTrack && (
        <div className="pt-4 mt-4 flex items-center justify-end">
          <button
            type="button"
            onClick={onTrack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-surface-tint transition-colors cursor-pointer group"
          >
            <span>Track Live Shipment</span>
            <svg
              className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-surface-tint"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
