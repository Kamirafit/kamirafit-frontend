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
    <fieldset>
      <div className="flex items-center justify-between">
        <legend className="text-[13px] font-semibold text-paper">
          {legend}
        </legend>
        {onReset && selected.length > 0 ? (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-medium text-paper-muted underline-offset-2 transition-colors hover:text-gold hover:underline"
          >
            Reset
          </button>
        ) : null}
      </div>
      <div className="mt-3 flex flex-col gap-2.5">
        {options.map((opt) => {
          const checked = selected.includes(opt.value);
          return (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center justify-between gap-3 text-[13.5px] text-paper transition-colors hover:text-gold"
            >
              <span className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(opt.value)}
                  className="h-4 w-4 rounded-[4px] border-line-strong bg-ink text-paper accent-paper focus:ring-gold/30"
                />
                <span>{opt.label}</span>
              </span>
              {typeof opt.count === "number" ? (
                <span className="text-[12px] tabular-nums text-paper-muted">
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
