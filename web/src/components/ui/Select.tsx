import * as RadixSelect from "@radix-ui/react-select";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { useFieldControl } from "./Field";

/* ──────────────────────────────────────────────────────────────
 * Select (Dropdown) — Radix Select 위에 우리 토큰만 입힌 것.
 *
 * 왜 native <select> 가 아닌가: 옵션마다 부가 설명(업종별 평균 생존율 등)을
 * 붙여야 하는데 native 옵션은 텍스트 한 줄이 전부다.
 *
 * 왜 직접 만들지 않았나: 드롭다운은 접근성 함정이 가장 많은 컴포넌트다.
 * 포커스 트랩, 타이핑 점프, 화살표 순환, 스크린리더 role, 화면 밖으로
 * 나갈 때의 위치 뒤집기 — Radix 가 이미 다 처리한다. 우리는 색만 입힌다.
 *
 * 두 가지로 쓸 수 있다.
 *   ① 간단한 경우 — <Select options={…} value onValueChange />
 *   ② 복잡한 경우 — SelectRoot/Trigger/Content/Item 을 직접 조립
 * ────────────────────────────────────────────────────────────── */

export const SelectRoot = RadixSelect.Root;
export const SelectGroup = RadixSelect.Group;
export const SelectValue = RadixSelect.Value;

const selectTrigger = cva(
  [
    "flex w-full items-center justify-between gap-2",
    "bg-surface-sunken border border-border rounded-md",
    "text-fg text-left",
    "transition-[border-color,box-shadow] duration-150",
    "hover:border-border-strong",
    "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25",
    "data-[state=open]:border-accent",
    "data-[placeholder]:text-fg-subtle",
    "disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:border-border",
    "aria-[invalid=true]:border-negative",
  ],
  {
    variants: {
      size: {
        sm: "h-10 px-3 text-xs",
        md: "h-11 px-3.5 text-sm",
        lg: "h-14 px-4 text-md",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface SelectTriggerProps
  extends RadixSelect.SelectTriggerProps,
    VariantProps<typeof selectTrigger> {}

export function SelectTrigger({ size, className, children, ...props }: SelectTriggerProps) {
  return (
    <RadixSelect.Trigger className={cn(selectTrigger({ size }), className)} {...props}>
      {children}
      <RadixSelect.Icon asChild>
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-fg-subtle transition-transform duration-150 group-data-[state=open]:rotate-180"
        />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  );
}

export function SelectContent({ className, children, ...props }: RadixSelect.SelectContentProps) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        position="popper"
        sideOffset={4}
        className={cn(
          "z-50 min-w-[var(--radix-select-trigger-width)] max-h-[min(20rem,var(--radix-select-content-available-height))]",
          "overflow-hidden rounded-lg border border-border bg-surface-raised shadow-lg",
          "data-[state=open]:animate-[pop-in_0.14s_var(--ease-out-quart)]",
          className,
        )}
        {...props}
      >
        <RadixSelect.ScrollUpButton className="flex h-5 items-center justify-center bg-surface-raised text-fg-subtle">
          <ChevronUp aria-hidden="true" className="size-3.5" />
        </RadixSelect.ScrollUpButton>

        <RadixSelect.Viewport className="p-1">{children}</RadixSelect.Viewport>

        <RadixSelect.ScrollDownButton className="flex h-5 items-center justify-center bg-surface-raised text-fg-subtle">
          <ChevronDown aria-hidden="true" className="size-3.5" />
        </RadixSelect.ScrollDownButton>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
}

export interface SelectItemProps extends RadixSelect.SelectItemProps {
  /** 옵션 이름 아래 한 줄로 붙는 부연 설명 */
  description?: ReactNode;
}

export function SelectItem({ className, children, description, ...props }: SelectItemProps) {
  return (
    <RadixSelect.Item
      className={cn(
        "relative flex cursor-pointer select-none items-start gap-2 rounded-md py-1.5 pl-2 pr-8",
        "text-sm text-fg-body outline-none",
        "data-[highlighted]:bg-accent-subtle data-[highlighted]:text-accent-text",
        "data-[state=checked]:text-fg data-[state=checked]:font-medium",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
        className,
      )}
      {...props}
    >
      <span className="min-w-0 flex-1">
        <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
        {description ? (
          <span className="mt-0.5 block text-2xs font-normal text-fg-subtle">{description}</span>
        ) : null}
      </span>

      <RadixSelect.ItemIndicator className="absolute right-2 top-2">
        <Check aria-hidden="true" className="size-3.5 text-accent" />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
}

export function SelectLabel({ className, ...props }: RadixSelect.SelectLabelProps) {
  return (
    <RadixSelect.Label
      className={cn(
        "px-2 py-1.5 text-2xs font-medium uppercase tracking-wider text-fg-subtle",
        className,
      )}
      {...props}
    />
  );
}

export function SelectSeparator({ className, ...props }: RadixSelect.SelectSeparatorProps) {
  return (
    <RadixSelect.Separator className={cn("-mx-1 my-1 h-px bg-border-subtle", className)} {...props} />
  );
}

/* ── 편의 래퍼 ──────────────────────────────────────────────── */

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: ReactNode;
  disabled?: boolean;
}

export interface SelectProps<T extends string = string>
  extends VariantProps<typeof selectTrigger> {
  options: readonly SelectOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  /** Field 밖에서 단독으로 쓸 때 직접 넘기는 라벨 */
  "aria-label"?: string;
}

/** 옵션 목록만 넘기면 되는 기본형. 대부분의 화면은 이걸 쓴다. */
export function Select<T extends string = string>({
  options,
  value,
  onValueChange,
  placeholder = "선택하세요",
  size,
  className,
  ...rest
}: SelectProps<T>) {
  const field = useFieldControl();

  return (
    <SelectRoot value={value} onValueChange={onValueChange as (v: string) => void} disabled={field.disabled}>
      <SelectTrigger
        size={size}
        className={cn("group", className)}
        id={field.id}
        aria-describedby={field["aria-describedby"]}
        aria-invalid={field["aria-invalid"]}
        {...rest}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            description={option.description}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}
