import { StarIcon } from "./icons";

type Props = {
  rating: number;
  max?: number;
  size?: number;
};

export default function StarRating({ rating, max = 5, size = 14 }: Props) {
  const rounded = Math.round(rating);
  return (
    <div
      className="flex items-center gap-0.5 text-amber-500"
      aria-label={`Rated ${rating.toFixed(1)} out of ${max}`}
    >
      {Array.from({ length: max }).map((_, i) => (
        <StarIcon
          key={i}
          width={size}
          height={size}
          filled={i < rounded}
          className={i < rounded ? "text-amber-500" : "text-neutral-300"}
        />
      ))}
      <span className="ml-1 text-[11px] font-medium text-neutral-500">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}
