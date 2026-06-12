import type { ComponentType, SVGProps } from "react";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import { DeliveryIcon, QualityIcon, ReturnsIcon } from "./icons";

type Feature = {
  title: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const FEATURES: Feature[] = [
  {
    title: "Premium Quality",
    description:
      "Heavyweight organic cotton and ethically sourced materials, built to last season after season.",
    Icon: QualityIcon,
  },
  {
    title: "Fast Delivery",
    description:
      "Free carbon-neutral shipping on orders over $75. Most orders arrive in 2–4 business days.",
    Icon: DeliveryIcon,
  },
  {
    title: "Easy Returns",
    description:
      "Changed your mind? Return anything within 30 days — no questions, no fuss.",
    Icon: ReturnsIcon,
  },
];

export default function WhyChooseUs() {
  return (
    <Section id="about">
      <SectionHeader
        eyebrow="Why KamiraFit"
        title="Details that make the difference."
      />

      <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {FEATURES.map(({ title, description, Icon }) => (
          <div
            key={title}
            className="group relative flex flex-col rounded-2xl border border-line bg-ink-2/60 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:bg-ink-2 hover:shadow-[0_30px_60px_-30px_rgba(139,30,45,0.2)]"
          >
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-gold/50 bg-ink text-gold shadow-[inset_0_0_0_1px_rgba(139,30,45,0.08)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:border-gold">
              <Icon width={22} height={22} />
            </span>
            <h3 className="mt-6 font-display text-xl font-semibold text-paper">
              {title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-paper-muted">
              {description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
