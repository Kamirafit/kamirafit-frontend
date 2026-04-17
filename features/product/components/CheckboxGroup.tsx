"use client";

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  legend: string;
  options: Option<T>[];
  selected: T[];
  onChange: (next: T[]) => void;
};

export default function CheckboxGroup<T extends string>({
  legend,
  options,
  selected,
  onChange,
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
      <legend className="text-[10px] font-semibold uppercase tracking-[0.28em] text-paper-muted">
        {legend}
      </legend>
      <div className="mt-3 flex flex-col gap-2.5">
        {options.map((opt) => {
          const checked = selected.includes(opt.value);
          return (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-2.5 text-sm transition-colors ${
                checked ? "text-gold" : "text-paper hover:text-gold"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(opt.value)}
                className="h-4 w-4 rounded border-line bg-ink-2 text-gold accent-gold focus:ring-gold/50"
              />
              <span>{opt.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
