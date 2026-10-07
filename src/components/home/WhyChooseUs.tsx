import type { ComponentType, SVGProps } from "react";
import { DeliveryIcon, QualityIcon, ReturnsIcon } from "./icons";

type Feature = {
  standard: string;
  title: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const FEATURES: Feature[] = [
  {
    standard: "STANDARD 01",
    title: "Artisanal Sourcing",
    description:
      "Organic flax linen and ethically harvested cotton loomed to endure through seasonal rotations without fading.",
    Icon: QualityIcon,
  },
  {
    standard: "STANDARD 02",
    title: "Carbon-Neutral Courier",
    description:
      "Complimentary speed transit on orders surpassing ₹999. Handled with verified real-time tracking across India.",
    Icon: DeliveryIcon,
  },
  {
    standard: "STANDARD 03",
    title: "7-Day Courteous Exchanges",
    description:
      "Try silhouettes within the sanctity of home. Hassle-free doorstep pickup arranged via a single click.",
    Icon: ReturnsIcon,
  },
];

export default function WhyChooseUs() {
  return (
    <section id="about" className="w-full py-8 sm:py-10 border-b border-outline-variant/40 bg-surface">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant/50">
          {FEATURES.map(({ standard, title, description, Icon }) => (
            <div
              key={standard}
              className="py-4 md:py-2 md:px-8 first:pl-0 last:pr-0 flex items-start gap-4 group"
            >
              <span className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary flex-shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:bg-primary-container group-hover:text-white">
                <Icon width={22} height={22} />
              </span>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-outline">
                  {standard}
                </span>
                <h3 className="font-serif text-xl font-medium text-primary mt-0.5 mb-1.5">
                  {title}
                </h3>
                <p className="font-sans text-xs text-on-surface-variant font-light leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
