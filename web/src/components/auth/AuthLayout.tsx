import { AlertTriangle, Check, MailCheck } from "lucide-react";
import type { ReactNode } from "react";

import { CompassArt } from "@/components/brand/CompassArt";
import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { ScoreRing } from "@/components/ScoreRing";
import { cn } from "@/lib/cn";

import { ThemeToggle } from "../ThemeToggle";

/* ──────────────────────────────────────────────────────────────
 * 로그인 계열 화면의 공통 틀 — 로그인/가입/재설정, 새 비밀번호.
 *
 * 왼쪽은 "여기가 무엇을 해주는 곳인가", 오른쪽은 입력. 로그인이 필수인
 * 서비스에서 폼만 덩그러니 띄우면, 처음 온 사람은 무엇에 가입하는지 모른 채
 * 이메일을 적어야 한다.
 * ────────────────────────────────────────────────────────────── */

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-surface lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <IntroPanel />

      <div className="relative flex flex-col">
        <header className="flex items-center justify-between px-5 py-3 sm:px-8 lg:justify-end">
          {/* 좁은 화면에선 왼쪽 소개 패널이 위로 올라오므로 로고는 그쪽이 맡는다 */}
          <ThemeToggle />
        </header>

        <main className="flex flex-1 items-center justify-center px-5 pb-10 pt-2 sm:px-8">
          <div className="w-full max-w-[26.25rem]">
            <h2 className="font-display text-3xl font-bold tracking-[-0.02em] text-fg">{title}</h2>
            <p className="mt-2.5 text-md leading-relaxed text-fg-body">{description}</p>
            {children}
          </div>
        </main>

        <footer className="px-5 pb-6 text-center sm:px-8">
          <p className="text-2xs leading-relaxed text-fg-subtle">
            데이터 출처 · 서울 열린데이터광장「우리마을가게 상권분석서비스」 · 공공누리 제1유형
            {" · "}
            <a href="/privacy" className="underline underline-offset-2 hover:text-fg-muted">
              개인정보처리방침
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

/** 폼 안의 오류(negative)·완료 안내(positive) 상자. */
export function AuthAlert({
  tone,
  children,
  className,
}: {
  tone: "error" | "success";
  children: ReactNode;
  className?: string;
}) {
  const Icon = tone === "error" ? AlertTriangle : MailCheck;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-md px-3.5 py-3 text-sm leading-relaxed",
        tone === "error"
          ? "bg-negative-subtle text-negative-text"
          : "bg-positive-subtle text-positive-text",
        className,
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/* ── 왼쪽: 이 서비스가 무엇인가 ────────────────────────────── */

const TRUST = ["데이터 근거", "AI 검증", "위험까지 솔직하게"];

function IntroPanel() {
  return (
    <section className="relative flex flex-col overflow-hidden bg-[linear-gradient(160deg,var(--brand-abyss)_0%,var(--brand-deep)_60%,var(--brand-glow)_100%)] px-6 py-7 text-brand-fg sm:px-10 lg:min-h-screen lg:px-[4.5rem] lg:py-14">
      <CompassArt className="absolute -bottom-40 -right-40 hidden w-[46rem] opacity-20 lg:block" />

      <div className="relative flex items-center gap-3">
        <LogoMark size={44} tone="onBrand" />
        <Wordmark tone="onBrand" className="text-xl" />
      </div>

      <div className="relative mt-5 lg:my-auto lg:py-16">
        <p className="hidden text-sm font-semibold text-brand-gold lg:block">내 가게를 위한 첫 번째 선택</p>
        <h1 className="mt-3 font-display text-2xl font-bold leading-[1.36] tracking-[-0.035em] text-brand-fg lg:text-4xl">
          시작하는 사장님께,
          <br />
          잘 맞는 골목을.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-brand-fg-muted lg:text-lg">
          어디에 가게를 열지 막막할 때,<br className="hidden sm:inline" />
          서울 상권 데이터로 차근차근 찾아보세요.
        </p>

        <ul className="mt-6 hidden flex-wrap gap-2 lg:flex">
          {TRUST.map((t) => (
            <li
              key={t}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-fg/20 bg-brand-fg/10 px-3.5 py-2 text-xs font-medium text-brand-fg"
            >
              <Check aria-hidden="true" className="size-3.5" strokeWidth={2.6} />
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* 제품 미리보기 — 실제 결과가 아니라 화면 예시다. 값을 지어낸 것이므로 "예시"를 밝힌다. */}
      <div
        aria-hidden="true"
        className="relative mt-9 hidden h-44 [@media(min-width:1024px)_and_(min-height:900px)]:block"
      >
        <p className="absolute -top-6 left-0 text-2xs font-medium text-brand-fg-muted">
          화면 예시
        </p>
        <div className="absolute left-0 top-0 flex w-[21.5rem] items-center gap-3.5 rounded-2xl border border-brand-fg/20 bg-brand-fg/10 p-5 shadow-sm backdrop-blur-md">
          <span className="flex size-9 items-center justify-center rounded-full bg-brand-gold font-display font-bold text-brand-abyss">
            1
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-md font-semibold text-brand-fg">예시 상권 A</p>
            <p className="text-xs text-brand-fg-muted">추천 1위</p>
          </div>
          <ScoreRing score={87} size={56} stroke={5} tone="onBrand" />
        </div>
        <div className="absolute left-16 top-[5.75rem] w-72 rounded-2xl border border-brand-fg/20 bg-brand-fg/10 p-4 shadow-sm backdrop-blur-md">
          <p className="inline-flex items-center gap-1 rounded-full bg-positive-subtle px-2.5 py-0.5 text-xs font-medium text-positive-text">
            <Check aria-hidden="true" className="size-3.5" strokeWidth={2.4} />
            데이터로 확인됨
          </p>
          <p className="mt-2 text-sm leading-relaxed text-brand-fg">
            저녁 시간대에 유동인구가 가장 많이 몰려요.
          </p>
        </div>
      </div>
    </section>
  );
}
