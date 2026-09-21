import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

const button = cva(
  [
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap",
    "font-medium rounded-md",
    "transition-[background-color,border-color,color] duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
    "disabled:opacity-50 disabled:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        solid: "bg-accent text-accent-fg shadow-sm hover:bg-accent-hover active:bg-accent-active",
        outline: "border border-border-strong bg-surface text-fg-body hover:bg-surface-sunken hover:border-border-strong",
        ghost: "text-fg-muted hover:bg-surface-sunken hover:text-fg",
        quiet: "text-accent-text hover:underline underline-offset-2",
      },
      size: {
        sm: "h-10 px-3.5 text-xs",
        md: "h-11 px-4 text-sm",
        lg: "h-14 px-6 text-md font-semibold",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: { variant: "outline", size: "md" },
  },
);

export interface ButtonProps
  extends ComponentPropsWithRef<"button">,
    VariantProps<typeof button> {
  /** 자식 엘리먼트에 스타일만 입힌다 — <a> 를 버튼처럼 보이게 할 때 */
  asChild?: boolean;
}

export function Button({ variant, size, asChild = false, className, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(button({ variant, size }), className)} {...props} />;
}
