"use client";

type Option<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

type Props<T extends string> = {
  legend: string;
  options: Option<T>[];
  selected: T[];
  onChange: (next: T[]) => void;
  onReset?: () => void;
};

export default function CheckboxGroup<T extends string>({
  legend,
  options,
  selected,
  onChange,
  onReset,
}: Props<T>) {
  const toggle = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <fieldset className="space-y-3">
      <div className="flex items-center justify-between">
        <legend className="font-sans text-xs font-bold text-primary uppercase tracking-wider">
          {legend}
        </legend>
        {onReset && selected.length > 0 ? (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-semibold text-surface-tint hover:underline uppercase tracking-wider cursor-pointer"
          >
            Reset
          </button>
        ) : null}
      </div>
      <div
        className={`space-y-2 ${
          options.length > 5
            ? "max-h-48 overflow-y-auto pr-1.5 custom-filter-scrollbar"
            : ""
        }`}
      >
        {options.map((opt) => {
          const checked = selected.includes(opt.value);
          return (
            <label
              key={opt.value}
              className="flex items-center justify-between text-xs text-secondary hover:text-primary cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(opt.value)}
                  className="w-4 h-4 rounded border-outline-variant/60 bg-surface-container-low text-primary-container focus:ring-0 accent-primary-container cursor-pointer"
                />
                <span className="font-sans text-xs font-medium">{opt.label}</span>
              </div>
              {typeof opt.count === "number" ? (
                <span className="font-sans text-xs text-outline tabular-nums">
                  {opt.count}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
