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

      <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
        {FEATURES.map(({ title, description, Icon }) => (
          <div key={title} className="flex flex-col">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-900">
              <Icon width={22} height={22} />
            </span>
            <h3 className="mt-6 text-lg font-semibold text-neutral-900">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              {description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
