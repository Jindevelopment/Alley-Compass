import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import type { RichParts } from "@/lib/rich";

import { Rich } from "./Rich";

/* AskPanel(축소된 대화형 재탐색)과 OnboardingChat(첫 진입 풀스크린)이
 * 같은 대화 로그 모양을 쓴다 — 메시지 배열 하나로 두 군데를 그린다. */

export interface Message {
  id: number;
  from: "user" | "bot";
  parts: RichParts;
}

export interface ChatLogProps {
  messages: readonly Message[];
  /** 메시지가 아직 없을 때 보여줄 안내문 */
  emptyHint: ReactNode;
  className?: string;
}

export function ChatLog({ messages, emptyHint, className }: ChatLogProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div
      ref={logRef}
      role="log"
      aria-live="polite"
      aria-label="분석 대화 기록"
      className={cn("scroll-slim flex flex-col gap-4 overflow-y-auto", className)}
    >
      {messages.length === 0 && emptyHint ? (
        <p className="w-fit max-w-[88%] rounded-2xl rounded-bl-md bg-surface-sunken px-4 py-3 text-base leading-relaxed text-fg-body">
          {emptyHint}
        </p>
      ) : null}

      {messages.map((m) => (
        <div key={m.id} className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}>
          <div
            className={cn(
              "max-w-[88%] px-4 py-3 text-base leading-relaxed",
              m.from === "user"
                ? "rounded-2xl rounded-br-md bg-accent text-accent-fg"
                : "rounded-2xl rounded-bl-md bg-surface-sunken text-fg",
            )}
          >
            <span className="sr-only">{m.from === "user" ? "나: " : "골목 컴퍼스: "}</span>
            <Rich parts={m.parts} />
          </div>
        </div>
      ))}
    </div>
  );
}
