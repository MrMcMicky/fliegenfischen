"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Compass, Fish, Leaf, Sparkles, Waves } from "lucide-react";

const icons = [Leaf, Fish, Sparkles, Compass, Waves];

export function TimelineSteps({
  steps,
}: {
  steps: { step: ReactNode; title: ReactNode; detail: ReactNode }[];
}) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-0 h-full w-0.5 bg-[var(--color-border)]" />
      {steps.map((step, index) => {
        const Icon = icons[index % icons.length];
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="relative flex gap-6 pb-8 last:pb-0"
          >
            <div className="relative flex w-8 flex-col items-center">
              <span className="z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-forest)]">
                <Icon size={18} />
              </span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-muted)]">
                {step.step}
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-[var(--color-text)]">
                {step.title}
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {step.detail}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
