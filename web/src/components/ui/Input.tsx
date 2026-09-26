import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

import { useFieldControl } from "./Field";

/* ──────────────────────────────────────────────────────────────
 * Input — 한 줄 텍스트 입력.
 *
 * 설계 원칙
 *  · Field 안에 두면 id·aria-describedby·aria-invalid 가 자동으로 붙는다.
 *  · 앞뒤 장식(addon)을 텍스트로 받는다. 금액의 "만원", 코드의 "#" 같은
 *    단위가 화면에서 자주 필요한데, placeholder 로 때우면 값이 들어간
 *    뒤 사라져서 단위를 알 수 없게 된다.
 *  · numeric 을 켜면 수치용 서체(tabular-nums)로 바뀐다. 상권 코드·금액이
 *    표와 세로로 정렬돼야 읽힌다.
 * ────────────────────────────────────────────────────────────── */

const inputWrapper = cva(
  [
    "flex min-w-0 items-center gap-2 w-full",
    "bg-surface-sunken border border-border rounded-md",
    "transition-[border-color,box-shadow] duration-150",
    "focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25",
    "has-[input:disabled]:opacity-55 has-[input:disabled]:cursor-not-allowed",
    "has-[input[aria-invalid]]:border-negative",
    "has-[input[aria-invalid]]:focus-within:ring-negative/25",
  ],
  {
    variants: {
      size: {
        sm: "h-11 px-3 text-base sm:h-10 sm:text-xs",
        md: "h-11 px-3.5 text-base sm:text-sm",
        lg: "h-14 px-4 text-md",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface InputProps
  extends Omit<ComponentPropsWithRef<"input">, "size" | "prefix">,
    VariantProps<typeof inputWrapper> {
  /** 입력칸 왼쪽에 고정되는 장식 — 아이콘이나 "₩" 같은 기호 */
  prefix?: ReactNode;
  /** 오른쪽에 고정되는 단위 — "만원", "%", "개" */
  suffix?: ReactNode;
  /** 숫자 입력용. tabular-nums + 오른쪽 정렬로 표와 자릿수를 맞춘다. */
  numeric?: boolean;
  /** 바깥 상자에 붙는 클래스. className 은 input 자체에 붙는다. */
  wrapperClassName?: string;
}

export function Input({
  size,
  prefix,
  suffix,
  numeric = false,
  className,
  wrapperClassName,
  ...props
}: InputProps) {
  const field = useFieldControl();

  return (
    <div className={cn(inputWrapper({ size }), wrapperClassName)}>
      {prefix ? (
        <span aria-hidden="true" className="shrink-0 text-fg-subtle">
          {prefix}
        </span>
      ) : null}

      <input
        {...field}
        {...props}
        className={cn(
          "min-w-0 flex-1 bg-transparent text-fg",
          "placeholder:text-fg-subtle",
          "outline-none disabled:cursor-not-allowed",
          // 상자가 이미 포커스 링을 그리므로 input 자체 아웃라인은 끈다
          "focus-visible:outline-none",
          numeric && "font-mono tabular-nums text-right",
          className,
        )}
      />

      {suffix ? (
        <span className="shrink-0 text-2xs text-fg-subtle whitespace-nowrap">{suffix}</span>
      ) : null}
    </div>
  );
}
