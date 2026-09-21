import { Check } from "lucide-react";

import { CompassArt } from "@/components/brand/CompassArt";
import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";

/* ──────────────────────────────────────────────────────────────
 * 첫 접속 로딩 화면.
 *
 * 단순한 스피너 대신 "지금 무엇을 하는 중인지"를 단계로 보여준다. 무료 호스팅
 * 백엔드는 잠들어 있다가 첫 요청에 깨어나는 데 최대 1분쯤 걸리는데, 아무 설명
 * 없이 스피너만 돌면 사용자는 고장으로 오해하고 창을 닫는다.
 *
 * stage 는 "지금 진행 중인 단계"의 번호다. 값은 호출하는 쪽이 실제 진행 상황에서
 * 정한다 — 시간이 지나면 저절로 넘어가는 가짜 진행 표시는 쓰지 않는다.
 *   0 로그인 확인 중   1 화면 불러오는 중   2 분석 서버 연결 중   3 추천 화면 준비 중
 * ────────────────────────────────────────────────────────────── */

const STEPS = ["로그인 정보 확인", "서비스 화면 불러오기", "분석 서버 연결", "추천 화면 준비"] as const;

export type LoadingStage = 0 | 1 | 2 | 3;

export function LoadingScreen({ stage = 0 }: { stage?: LoadingStage }) {
  return (
    <div
      aria-busy="true"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_35%,var(--brand-glow)_0%,var(--brand-deep)_38%,var(--brand-abyss)_100%)] px-6 py-10 text-brand-fg"
    >
      <CompassArt className="absolute left-1/2 top-1/2 w-[min(1000px,160vw)] -translate-x-1/2 -translate-y-1/2 opacity-70" />

      <div className="relative flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <div className="relative flex size-[214px] items-center justify-center">
          <span aria-hidden="true" className="absolute inset-0 animate-orbit">
            <svg viewBox="0 0 214 214" className="size-full">
              <circle
                cx="107"
                cy="107"
                r="103"
                fill="none"
                strokeWidth="1.5"
                strokeDasharray="3 9"
                strokeOpacity="0.45"
                className="stroke-brand-teal"
              />
              <circle cx="107" cy="4" r="6" className="fill-brand-gold" />
            </svg>
          </span>
          <span className="flex size-[150px] items-center justify-center rounded-full bg-brand-fg/[0.06]">
            <LogoMark size={120} tone="onBrand" />
          </span>
        </div>

        <div>
          <Wordmark tone="onBrand" className="text-3xl" />
          <p className="mt-2 text-md text-brand-fg-muted">골목의 생존 확률을 계산하고 있어요</p>
        </div>

        <div
          aria-hidden="true"
          className="relative h-1.5 w-72 overflow-hidden rounded-full bg-brand-fg/15"
        >
          <span className="absolute left-0 top-0 h-1.5 w-[36%] animate-slide rounded-full bg-gradient-to-r from-brand-teal to-brand-gold" />
        </div>

        <ol role="status" aria-live="polite" className="flex w-72 flex-col gap-3.5 text-left">
          {STEPS.map((label, i) => {
            const state = i < stage ? "done" : i === stage ? "now" : "wait";
            return (
              <li
                key={label}
                aria-current={state === "now" ? "step" : undefined}
                className={cn(
                  "flex items-center gap-3.5 text-base",
                  state === "now" ? "font-semibold text-brand-fg" : "font-medium",
                  state === "done" && "text-brand-fg/85",
                  state === "wait" && "text-brand-fg-muted/70",
                )}
              >
                {state === "done" ? (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-teal/20 text-brand-teal">
                    <Check aria-hidden="true" className="size-4" strokeWidth={2.6} />
                  </span>
                ) : state === "now" ? (
                  <span
                    aria-hidden="true"
                    className="size-6 shrink-0 animate-spin rounded-full border-[3px] border-brand-gold/30 border-t-brand-gold"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="size-6 shrink-0 rounded-full border-2 border-brand-fg/25"
                  />
                )}
                {label}
                <span className="sr-only">
                  {state === "done" ? " 완료" : state === "now" ? " 진행 중" : " 대기"}
                </span>
              </li>
            );
          })}
        </ol>

        {stage >= 2 ? (
          <p className="text-sm leading-relaxed text-brand-fg-muted">
            처음 접속하면 서버가 깨어나는 데{" "}
            <b className="font-semibold text-brand-fg">최대 1분</b> 정도 걸릴 수 있어요.
            <br />이 화면을 닫지 말고 잠시만 기다려 주세요.
          </p>
        ) : null}

        <div className="w-full rounded-xl border border-brand-fg/15 bg-brand-fg/[0.07] px-5 py-4 text-left">
          <p className="text-2xs font-semibold text-brand-gold">알아두면 좋아요</p>
          <p className="mt-1.5 text-sm leading-relaxed text-brand-fg-muted">
            점포 하나당 배후 수요(유동·상주·직장 인구)가 클수록, 비슷한 가게끼리 손님을 나눠 갖는
            부담이 적어요.
          </p>
        </div>
      </div>
    </div>
  );
}
