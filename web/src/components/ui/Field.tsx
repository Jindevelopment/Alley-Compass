import { createContext, useContext, useId } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/* ──────────────────────────────────────────────────────────────
 * Field — 입력 컨트롤의 라벨·보조설명·에러를 묶는 껍데기.
 *
 * 왜 따로 두는가: id 와 aria-describedby 를 손으로 이으면 반드시 빠뜨린다.
 * Field 가 id 세 개를 만들어 context 로 내려주고, Input/Select/Slider 는
 * useFieldControl() 로 자기에게 필요한 aria 속성을 통째로 받아간다.
 * 덕분에 새 컨트롤을 추가해도 접근성 배선이 공짜로 따라온다.
 *
 *   <Field>
 *     <FieldLabel hint="무엇을 열까">업종</FieldLabel>
 *     <Select … />
 *     <FieldHint>선택한 업종에 맞춰 가중치가 재조정됩니다</FieldHint>
 *   </Field>
 * ────────────────────────────────────────────────────────────── */

interface FieldContextValue {
  controlId: string;
  hintId: string;
  errorId: string;
  hasHint: boolean;
  hasError: boolean;
  disabled: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export interface FieldProps {
  children: ReactNode;
  /** 에러 메시지. 있으면 컨트롤이 aria-invalid 상태가 된다. */
  error?: string;
  /** 보조 설명이 붙는지. FieldHint 를 쓰면 자동으로 감지되지 않으므로 명시한다. */
  hint?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Field({ children, error, hint = false, disabled = false, className }: FieldProps) {
  const uid = useId();

  return (
    <FieldContext.Provider
      value={{
        controlId: `${uid}-control`,
        hintId: `${uid}-hint`,
        errorId: `${uid}-error`,
        hasHint: hint,
        hasError: Boolean(error),
        disabled,
      }}
    >
      <div className={cn("flex flex-col gap-1.5", className)}>
        {children}
        {error ? <FieldError>{error}</FieldError> : null}
      </div>
    </FieldContext.Provider>
  );
}

/**
 * 컨트롤이 자기에게 필요한 id·aria 속성을 받아가는 훅.
 * Field 밖에서 쓰면 빈 객체를 돌려주므로, 컨트롤을 단독으로도 쓸 수 있다.
 */
export function useFieldControl(): {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  disabled?: boolean;
} {
  const ctx = useContext(FieldContext);
  if (!ctx) return {};

  const describedBy = [ctx.hasHint && ctx.hintId, ctx.hasError && ctx.errorId]
    .filter(Boolean)
    .join(" ");

  return {
    id: ctx.controlId,
    ...(describedBy ? { "aria-describedby": describedBy } : {}),
    ...(ctx.hasError ? { "aria-invalid": true as const } : {}),
    ...(ctx.disabled ? { disabled: true } : {}),
  };
}

export interface FieldLabelProps {
  children: ReactNode;
  /** 라벨 오른쪽에 붙는 짧은 부연. "업종 · 무엇을 열까" 처럼 읽힌다. */
  hint?: ReactNode;
  className?: string;
}

export function FieldLabel({ children, hint, className }: FieldLabelProps) {
  const ctx = useContext(FieldContext);

  return (
    <label
      htmlFor={ctx?.controlId}
      className={cn(
        "flex items-baseline justify-between gap-2 text-sm font-semibold text-fg",
        ctx?.disabled && "opacity-55",
        className,
      )}
    >
      {children}
      {hint ? <span className="text-xs font-normal text-fg-muted">{hint}</span> : null}
    </label>
  );
}

export function FieldHint({ children, className }: { children: ReactNode; className?: string }) {
  const ctx = useContext(FieldContext);
  return (
    <p id={ctx?.hintId} className={cn("text-2xs text-fg-muted", className)}>
      {children}
    </p>
  );
}

export function FieldError({ children, className }: { children: ReactNode; className?: string }) {
  const ctx = useContext(FieldContext);
  return (
    <p
      id={ctx?.errorId}
      role="alert"
      className={cn("text-2xs font-medium text-negative-text", className)}
    >
      {children}
    </p>
  );
}
