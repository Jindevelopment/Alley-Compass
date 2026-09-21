import * as RadixSlider from "@radix-ui/react-slider";

import { cn } from "@/lib/cn";

import { useFieldControl } from "./Field";

/* 단일 값 슬라이더. 예산처럼 "대략 이쯤"을 빠르게 훑을 때 쓴다.
 * 정확한 값이 필요하면 Input numeric 을 함께 놓는다 — 슬라이더만으로는
 * 5,000 과 5,500 을 구분해 집기 어렵다. */

export interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** 손잡이를 놓았을 때만 알림 — 드래그 중 재계산이 무거운 경우 */
  onValueCommit?: (value: number) => void;
  "aria-label"?: string;
  className?: string;
}

export function Slider({
  value,
  onValueChange,
  onValueCommit,
  min,
  max,
  step = 1,
  className,
  ...rest
}: SliderProps) {
  const field = useFieldControl();

  return (
    <RadixSlider.Root
      id={field.id}
      aria-describedby={field["aria-describedby"]}
      disabled={field.disabled}
      value={[value]}
      onValueChange={([next]) => next !== undefined && onValueChange(next)}
      onValueCommit={
        onValueCommit ? ([next]) => next !== undefined && onValueCommit(next) : undefined
      }
      min={min}
      max={max}
      step={step}
      className={cn(
        "relative flex h-8 w-full touch-none select-none items-center",
        "data-[disabled]:opacity-55",
        className,
      )}
      {...rest}
    >
      <RadixSlider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-border">
        <RadixSlider.Range className="absolute h-full bg-accent" />
      </RadixSlider.Track>
      <RadixSlider.Thumb
        className={cn(
          "block size-6 rounded-full border-2 border-accent bg-surface shadow-xs",
          "transition-transform duration-100 hover:scale-110",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        )}
      />
    </RadixSlider.Root>
  );
}
