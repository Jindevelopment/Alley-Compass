import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

/* 짧은 상태 표시. 톤은 tokens.semantic.css 의 의미색과 1:1 대응한다 —
 * 색을 눈대중으로 고르지 않고 "무슨 의미인가"로 고르게 만들기 위해서다. */
const badge = cva(
  "inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-surface-sunken border-border text-fg-muted",
        accent: "bg-accent-subtle border-accent-border text-accent-text",
        positive: "bg-positive-subtle border-positive-border text-positive-text",
        caution: "bg-caution-subtle border-caution-border text-caution-text",
        negative: "bg-negative-subtle border-negative-border text-negative-text",
        nodata: "bg-nodata-subtle border-dashed border-nodata-border text-fg-subtle",
      },
      size: {
        sm: "px-2.5 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
      },
      /** 수치를 담을 때 — 자릿수 정렬 */
      mono: { true: "font-mono tabular-nums", false: "" },
    },
    defaultVariants: { tone: "neutral", size: "sm", mono: false },
  },
);

export interface BadgeProps
  extends ComponentPropsWithRef<"span">,
    VariantProps<typeof badge> {}

export function Badge({ tone, size, mono, className, ...props }: BadgeProps) {
  return <span className={cn(badge({ tone, size, mono }), className)} {...props} />;
}
