import { StarIcon } from "./icons";

type Props = {
  rating: number;
  max?: number;
  size?: number;
  showValue?: boolean;
};

export default function StarRating({ rating, max = 5, size = 14, showValue = true }: Props) {
  const rounded = Math.round(rating);
  return (
    <div
      className="flex items-center gap-0.5 text-gold"
      aria-label={`Rated ${rating.toFixed(1)} out of ${max}`}
    >
      {Array.from({ length: max }).map((_, i) => (
        <StarIcon
          key={i}
          width={size}
          height={size}
          filled={i < rounded}
          className={i < rounded ? "text-gold" : "text-line-strong"}
        />
      ))}
      {showValue && (
        <span className="ml-1 text-[11px] font-medium text-paper-muted">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
