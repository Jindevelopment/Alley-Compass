import { ArrowRight, ChartNoAxesCombined, Loader2, MapPin, Store } from "lucide-react";
import { useRef, useState } from "react";

import { LogoMark } from "@/components/brand/Logo";
import { Button, Input, type SelectOption } from "@/components/ui";

import { ChatLog, type Message } from "./ChatLog";

/* ──────────────────────────────────────────────────────────────
 * 첫 진입 화면 — 조건을 아직 한 번도 입력한 적 없는 사용자용 풀스크린 채팅.
 *
 * 여기서 첫 조건이 확정되면(App.tsx의 handleParse가 랭킹까지 성공시키면)
 * 이 화면은 사라지고 일반 레이아웃(랭킹 + 축소된 AskPanel)으로 넘어간다.
 * 그 뒤로는 이 조건을 localStorage에 기억해 두므로, 다음 로그인부터는
 * 이 화면을 다시 보지 않는다(conditionsStorage.ts).
 *
 * onParse는 App.tsx의 handleParse 그대로다 — AskPanel과 로직을 공유하고
 * 화면 배치만 다르다.
 * ────────────────────────────────────────────────────────────── */

export interface OnboardingChatProps {
  messages: readonly Message[];
  onParse: (message: string) => void;
  /** 이번 문장의 파싱·재랭킹이 진행 중인가 */
  busy: boolean;
  /** 업종 목록을 아직 못 받아왔나 — 이때는 입력을 막는다(검증할 목록이 없음) */
  bootLoading: boolean;
  bizOptions: readonly SelectOption[];
}

export function OnboardingChat({ messages, onParse, busy, bootLoading, bizOptions }: OnboardingChatProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const disabled = busy || bootLoading;

  const submit = () => {
    const message = draft.trim();
    if (!message || disabled) return;
    onParse(message);
  };

  return (
    <div className="mx-auto w-full max-w-3xl py-4 sm:py-10">
      <div className="flex flex-col items-start">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-accent-subtle px-4 py-2 text-sm font-semibold text-accent-text">
          <LogoMark size={24} /> 나의 첫 상권 찾기
        </span>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-[-0.035em] text-fg sm:text-4xl">
          꿈꾸던 내 가게,<br />어떤 골목이 잘 맞을까요?
        </h1>
        <p className="mt-5 text-md leading-relaxed text-fg-muted">
          준비 중인 업종과 원하는 동네 분위기를 알려주세요.<br className="hidden sm:block" />
          서울 골목상권 데이터를 비교해 함께 찾아드릴게요.
        </p>
      </div>

      <section aria-labelledby="start-heading" className="mt-8 rounded-2xl bg-surface p-5 shadow-sm sm:p-8">
        <h2 id="start-heading" className="text-lg font-semibold">어떤 가게를 준비하고 계세요?</h2>
        <p className="mt-1 text-sm text-fg-muted">업종을 누르면 예시가 입력돼요. 내 상황에 맞게 바꿔보세요.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {bizOptions.slice(0, 6).map((option) => (
            <Button key={option.value} variant="outline" disabled={disabled} onClick={() => {
              setDraft(`${option.label} 창업을 준비하고 있어요. 20–30대가 많이 찾는 상권을 추천해 주세요.`);
              inputRef.current?.focus();
            }}>
              <Store aria-hidden="true" className="size-4 text-accent-text" />{option.label}
            </Button>
          ))}
        </div>
      {messages.length > 0 ? (
        <ChatLog messages={messages} emptyHint="" className="mt-5 max-h-80" />
      ) : null}

      <form className="mt-6 flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <label htmlFor="onboarding-condition" className="text-sm font-semibold text-fg">원하는 창업 조건</label>
        <Input
          id="onboarding-condition"
          ref={inputRef}
          size="lg"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.nativeEvent.isComposing) e.preventDefault();
          }}
          placeholder={bootLoading ? "업종 정보를 불러오는 중…" : "예: 주거지 근처에 작은 카페를 열고 싶어요"}
          disabled={disabled}
          wrapperClassName="flex-1"
          aria-label="조건을 문장으로 입력"
          aria-describedby="onboarding-hint"
        />
        <p id="onboarding-hint" className="text-xs text-fg-muted">업종만 알려주셔도 괜찮아요. 나머지 조건은 결과를 보고 수정할 수 있어요.</p>
        <Button
          type="submit"
          variant="solid"
          size="lg"
          className="mt-2 h-auto min-h-14 w-full whitespace-normal py-3"
          disabled={disabled || !draft.trim()}
        >
          {busy ? (
            <Loader2 aria-hidden="true" className="size-5 animate-spin" />
          ) : (
            <ArrowRight aria-hidden="true" className="size-5" />
          )}
          {busy ? "상권을 찾고 있어요" : "나에게 맞는 상권 찾기"}
        </Button>
      </form>
      </section>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[{ icon: MapPin, title: "서울 골목을 한눈에", text: "추천 목록과 지도를 함께 살펴보세요." }, { icon: ChartNoAxesCombined, title: "좋은 점도, 주의할 점도", text: "유동인구와 경쟁 지표를 비교해 보세요." }].map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3 px-2 py-3">
            <span className="rounded-lg bg-accent-subtle p-3 text-accent-text"><Icon aria-hidden="true" className="size-5" /></span>
            <div><p className="font-semibold text-fg">{title}</p><p className="mt-1 text-sm text-fg-muted">{text}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
