"use client";

import type { LegalContent } from "@/lib/legal";

export function LegalContent({ content }: { content: LegalContent }) {
  return (
    <div className="space-y-6 text-sm text-[var(--color-muted)]">
      {content.intro ? (
        <p className="text-sm text-[var(--color-muted)]">{content.intro}</p>
      ) : null}
      {content.sections.map((section) => (
        <div key={section.title} className="space-y-2">
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            {section.title}
          </h3>
          {section.paragraphs.map((paragraph, index) => (
            <p key={`${section.title}-${index}`}>{paragraph}</p>
          ))}
          {section.lines && section.lines.length ? (
            <ul className="space-y-1 text-[var(--color-muted)]">
              {section.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
      {content.updatedAt ? (
        <p className="text-xs text-[var(--color-muted)]">{content.updatedAt}</p>
      ) : null}
    </div>
  );
}
