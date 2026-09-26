import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

/* ──────────────────────────────────────────────────────────────
 * Card — 이 서비스의 기본 담는 그릇.
 *
 * 이 화면은 카드가 매우 많다. 그래서 "전부 같은 카드"로 찍어내면 위계가
 * 사라진다. variant 를 역할별로 갈라 두고, 테두리·채움·그림자를 역할이
 * 필요할 때만 쓴다.
 *
 *   outline   기본. 표·목록을 담는 평범한 면
 *   raised    떠 있는 것 — 드로어, 팝오버. 그림자로만 구분한다
 *   sunken    카드 안의 카드. 테두리 없이 배경만 한 단계 눌러 표현
 *   nodata    ★ 이 서비스 고유. "데이터 미보유" 영역 전용.
 *             점선 테두리로 "비어 있음이 의도된 것"임을 보여준다 —
 *             숫자를 지어내지 않는다는 설계 원칙이 화면에 드러나는 자리다
 * ────────────────────────────────────────────────────────────── */

const card = cva("min-w-0 rounded-2xl", {
  variants: {
    variant: {
      outline: "bg-surface border border-border-subtle shadow-xs",
      raised: "bg-surface-raised border border-border shadow-sm",
      sunken: "bg-surface-sunken border border-border-subtle",
      nodata: "bg-nodata-subtle border border-dashed border-nodata-border",
    },
    /** 카드 전체가 눌리는 경우에만 켠다. 시각적으로 "누를 수 있음"을 약속한다. */
    interactive: {
      true: [
        "text-left w-full cursor-pointer",
        "transition-[border-color,background-color,box-shadow] duration-150",
        "hover:border-border-strong hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:border-accent",
        "active:translate-y-px",
      ],
      false: "",
    },
    /** 선택된 상태 — 랭킹 행처럼 목록 안에서 하나가 골라진 경우 */
    selected: {
      true: "border-accent bg-surface ring-2 ring-accent/30",
      false: "",
    },
  },
  defaultVariants: { variant: "outline", interactive: false, selected: false },
});

interface CardOwnProps<T extends ElementType> extends VariantProps<typeof card> {
  /** button·li·article 등으로 바꿔 렌더한다. interactive 면 보통 "button". */
  as?: T;
}

/** 다형(polymorphic) props — as 로 바꾼 태그의 속성을 그대로 받는다.
 *  as="button" 이면 type·disabled 이, as="a" 면 href 가 타입 체크된다. */
export type CardProps<T extends ElementType = "div"> = CardOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof CardOwnProps<T>>;

export function Card<T extends ElementType = "div">({
  as,
  variant,
  interactive,
  selected,
  className,
  ...props
}: CardProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return <Tag className={cn(card({ variant, interactive, selected }), className)} {...props} />;
}

/* ── 구성 요소 ──────────────────────────────────────────────── */

export interface CardHeaderProps {
  children: ReactNode;
  /** 헤더 오른쪽 끝에 붙는 것 — 배지, 점수, 버튼 */
  action?: ReactNode;
  /** 본문과 선으로 나눌지. 표가 바로 이어질 때 켜면 읽기 쉽다. */
  divided?: boolean;
  className?: string;
}

export function CardHeader({ children, action, divided = false, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 px-4 pt-3.5 pb-3",
        divided && "border-b border-border-subtle",
        className,
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** 제목 위에 붙는 분류 라벨. 대문자 자간으로 제목과 목소리를 분리한다. */
export function CardEyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "mb-1 font-mono text-2xs uppercase tracking-[0.12em] text-fg-subtle",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function CardTitle({
  children,
  as: Tag = "h3",
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return <Tag className={cn("text-md font-semibold text-fg", className)}>{children}</Tag>;
}

export function CardDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn("mt-0.5 text-xs text-fg-muted", className)}>{children}</p>;
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-4 pb-4", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-t border-border-subtle px-4 py-2.5 text-xs text-fg-muted",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * 카드 아래 붙는 주석. 데이터의 한계를 밝히는 문장이 자주 온다
 * ("상권 면적이 없어 점포수/면적 밀도 대신 수요 대비 공급으로 계산했다").
 * 본문보다 확실히 낮은 목소리여야 하지만 읽을 수는 있어야 한다.
 */
export function CardNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "mx-4 mb-3.5 border-l-2 border-border pl-2.5 text-2xs leading-relaxed text-fg-muted",
        className,
      )}
    >
      {children}
    </p>
  );
}
