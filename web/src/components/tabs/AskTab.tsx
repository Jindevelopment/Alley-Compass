import { ArrowUp, Loader2, MapPin } from "lucide-react";
import { useState } from "react";

import { AGE_LABEL, CHARACTER_LABEL, PRIORITY_LABEL } from "@/data/businessTypes";
import { fmt } from "@/lib/format";
import type { Conditions } from "@/types/domain";
import { Button, Input } from "@/components/ui";

import { ChatLog, type Message } from "../ChatLog";

/* ──────────────────────────────────────────────────────────────
 * 물어보기 탭 — 말로 조건을 정하는 곳.
 *
 * 왼쪽은 대화, 오른쪽은 "이렇게 이해했어요" 요약이다. 요약을 옆에 두는 이유는
 * AI 가 문장을 잘못 알아들었을 때 사용자가 그 자리에서 바로 알아채게 하려는 것이다.
 *
 * 예시 문장은 실제로 수집된 업종 이름으로만 만든다. 수집되지 않은 업종을 예시로
 * 보여주면, 눌러 보는 첫 시도부터 "아직 수집되지 않은 업종" 답을 받게 된다.
 * ────────────────────────────────────────────────────────────── */

export type QuickAskAction = "otherBiz" | "budget3000" | "age20" | "resident" | "reset";
export type { Message } from "../ChatLog";

export interface AskTabProps {
  messages: readonly Message[];
  conditions: Conditions;
  bizLabel: string;
  businessTypeCount: number;
  busy: boolean;
  onParse: (message: string) => void;
  onAsk: (action: QuickAskAction) => void;
  onGoRecommend: () => void;
}

export function AskTab({
  messages,
  conditions,
  bizLabel,
  businessTypeCount,
  busy,
  onParse,
  onAsk,
  onGoRecommend,
}: AskTabProps) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    const message = draft.trim();
    if (!message || busy) return;
    onParse(message);
    setDraft("");
  };

  const chips: Array<{ action: QuickAskAction; label: string }> = [
    ...(businessTypeCount > 1
      ? ([{ action: "otherBiz", label: "다른 업종으로 보면?" }] as const)
      : []),
    { action: "budget3000", label: "예산을 3,000만원으로" },
    { action: "age20", label: "20대 유동인구만" },
    { action: "resident", label: "조용한 주거 배후로" },
    { action: "reset", label: "처음 조건으로" },
  ];

  const rows: Array<[string, string]> = [
    ["업종", bizLabel],
    ["보증금 상한", `${fmt(conditions.budget)}만원 이하`],
    ["타깃 연령", AGE_LABEL[conditions.age]],
    ["상권 성격", CHARACTER_LABEL[conditions.character]],
    ["가장 중요한 것", PRIORITY_LABEL[conditions.priority]],
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <section
        aria-label="대화"
        className="flex min-w-0 flex-col rounded-2xl border border-border bg-surface shadow-sm lg:h-[calc(100dvh-9.5rem)] lg:min-h-[32rem]"
      >
        <div className="border-b border-border px-5 py-5 sm:px-8">
          <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-fg">
            어떤 가게를 열고 싶으세요?
          </h1>
          <p className="mt-1.5 text-md text-fg-muted">
            편하게 말씀해 주시면 조건을 정리해서 상권을 추천해 드려요.
          </p>
        </div>

        <ChatLog
          messages={messages}
          emptyHint={
            <>
              예: <b className="font-semibold text-fg-body">“{bizLabel} 열고 싶은데 보증금 5천만원
              이하로 20~30대가 많이 오는 곳”</b>
            </>
          }
          className="max-h-[45dvh] min-h-32 flex-1 px-5 py-6 sm:px-8 lg:max-h-none lg:min-h-0"
        />

        <div className="border-t border-border px-5 pb-5 pt-4 sm:px-8">
          <p className="mb-2 text-xs font-medium text-fg-muted">이런 식으로 바꿔 볼 수 있어요</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <Button
                key={chip.action}
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={busy}
                onClick={() => onAsk(chip.action)}
              >
                {chip.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              size="lg"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) submit();
              }}
              placeholder="조건을 문장으로 입력하세요"
              disabled={busy}
              wrapperClassName="flex-1"
              aria-label="조건을 문장으로 입력"
            />
            <Button
              variant="solid"
              size="lg"
              className="w-14 shrink-0 px-0"
              disabled={busy || !draft.trim()}
              onClick={submit}
              aria-label="보내기"
            >
              {busy ? (
                <Loader2 aria-hidden="true" className="size-5 animate-spin" />
              ) : (
                <ArrowUp aria-hidden="true" className="size-5" />
              )}
            </Button>
          </div>
        </div>
      </section>

      <aside
        aria-label="이해한 조건"
        className="h-fit rounded-2xl border border-border bg-surface p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-fg">이렇게 이해했어요</h2>
        <p className="mt-1 text-sm text-fg-muted">틀린 부분은 문장으로 다시 말씀해 주세요.</p>

        <dl className="mt-4">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-baseline gap-3 border-t border-border-subtle py-3.5"
            >
              <dt className="w-24 shrink-0 text-sm text-fg-muted sm:w-28">{label}</dt>
              <dd className="min-w-0 flex-1 text-md font-semibold text-fg">{value}</dd>
            </div>
          ))}
        </dl>

        <Button variant="solid" size="lg" className="mt-3 w-full" onClick={onGoRecommend}>
          <MapPin aria-hidden="true" className="size-5" />이 조건으로 추천 보기
        </Button>
      </aside>
    </div>
  );
}
