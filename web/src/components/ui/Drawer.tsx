import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/* ──────────────────────────────────────────────────────────────
 * Drawer — 오른쪽에서 밀려 나오는 상세 패널.
 *
 * 직접 만들지 않고 Radix Dialog 를 쓰는 이유가 분명하다.
 *  · 열렸을 때 뒤쪽 콘텐츠를 스크린리더에서 감춰야 한다 (aria-hidden 관리)
 *  · 포커스를 패널 안에 가둬야 하고, 닫으면 원래 눌렀던 행으로 돌려줘야 한다
 *  · Esc·바깥 클릭·배경 스크롤 잠금
 * 전부 직접 구현하면 반드시 하나는 빠진다.
 * ────────────────────────────────────────────────────────────── */

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 스크린리더가 읽는 패널 제목 */
  title: string;
  /** 헤더에 그려질 내용. 제목을 시각적으로 꾸미고 싶을 때. */
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Drawer({ open, onOpenChange, title, header, children, className }: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-40 bg-gray-950/45 backdrop-blur-[1px]",
            "data-[state=open]:animate-[scrim-in_0.2s_ease-out]",
          )}
        />

        <Dialog.Content
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-full max-w-[min(46rem,100vw)] flex-col",
            "border-l border-border bg-surface shadow-lg",
            "data-[state=open]:animate-[drawer-in_0.26s_var(--ease-out-quart)]",
            "focus:outline-none",
            className,
          )}
        >
          <div className="flex items-center gap-3 border-b border-border px-5 py-3">
            <div className="min-w-0 flex-1">
              {header ?? <Dialog.Title className="text-lg font-semibold text-fg">{title}</Dialog.Title>}
            </div>

            <Dialog.Close
              aria-label="닫기"
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-md text-fg-muted",
                "transition-colors hover:bg-surface-sunken hover:text-fg",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35",
              )}
            >
              <X aria-hidden="true" className="size-5" />
            </Dialog.Close>
          </div>

          <div className="scroll-slim min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** 헤더를 직접 그릴 때 제목 자리에 넣는다 — 스크린리더가 이걸 읽는다. */
export const DrawerTitle = Dialog.Title;
export const DrawerDescription = Dialog.Description;
