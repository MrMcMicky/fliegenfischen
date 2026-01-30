"use client";

import { motion } from "framer-motion";
import { Compass, Fish, Leaf, Sparkles, Waves } from "lucide-react";

import { coursePathSteps } from "@/lib/data";

const icons = [Leaf, Fish, Sparkles, Compass, Waves];

export function TimelineSteps() {
  return (
    <div className="relative border-l border-[var(--color-border)] pl-8">
      {coursePathSteps.map((step, index) => {
        const Icon = icons[index % icons.length];
        return (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="relative pb-8 last:pb-0"
          >
            <span className="absolute -left-[1.3rem] top-0 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-forest)]">
              <Icon size={16} />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-forest)]/60">
              {step.step}
            </p>
            <p className="mt-2 font-semibold text-[var(--color-text)]">
              {step.title}
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {step.detail}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
