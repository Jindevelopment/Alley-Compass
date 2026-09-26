import { Download, Info, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AGE_LABEL, CHARACTER_LABEL, PRIORITY_LABEL } from "@/data/businessTypes";
import { LogoMark } from "@/components/brand/Logo";
import { AuthAlert } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui";
import { fetchReportPdf } from "@/lib/api";
import { cn } from "@/lib/cn";
import { fmt } from "@/lib/format";
import type { RankResponse } from "@/types/api";
import type { Conditions } from "@/types/domain";

/* ──────────────────────────────────────────────────────────────
 * 리포트 탭 — 상위 상권과 추천·주의 근거를 PDF 한 장씩으로.
 *
 * POST /report 는 상권마다 Claude 를 최대 2회 부르므로 시간이 걸리고 과금된다.
 * 그래서 (1) 버튼을 눌러야만 부르고 (2) 진행 중에는 실제 경과 시간을 보여주며
 * (3) 그 비용을 누르기 전에 미리 알린다. 진행률(%)은 서버가 알려주지 않으므로
 * 지어내지 않고 경과 시간만 보여준다.
 * ────────────────────────────────────────────────────────────── */

const TOP_K_OPTIONS = [1, 3, 5, 10] as const;

export interface ReportTabProps {
  conditions: Conditions;
  meta: RankResponse | null;
  bizLabel: string;
  onGoRecommend: () => void;
  /** 401 등 공통 오류 처리는 App 이 맡는다. 화면에 띄울 문구가 있으면 문자열을 돌려준다. */
  onError: (e: unknown) => string | null;
}

export function ReportTab({ conditions, meta, bizLabel, onGoRecommend, onError }: ReportTabProps) {
  const [topK, setTopK] = useState<(typeof TOP_K_OPTIONS)[number]>(3);
  const [working, setWorking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearInterval(timer.current);
    },
    [],
  );

  const make = () => {
    setWorking(true);
    setError(null);
    setDone(false);
    setElapsed(0);
    timer.current = window.setInterval(() => setElapsed((s) => s + 1), 1000);

    fetchReportPdf(conditions, topK)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `골목컴퍼스_${bizLabel}_상위${topK}곳.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setDone(true);
      })
      .catch((e: unknown) => setError(onError(e) ?? "리포트를 만들지 못했어요. 잠시 후 다시 시도해 주세요."))
      .finally(() => {
        if (timer.current) window.clearInterval(timer.current);
        setWorking(false);
      });
  };

  const rows: Array<[string, string]> = [
    ["업종", bizLabel],
    ["보증금 상한", `${fmt(conditions.budget)}만원 이하`],
    ["타깃 연령", AGE_LABEL[conditions.age]],
    ["상권 성격", CHARACTER_LABEL[conditions.character]],
    ["가장 중요한 것", PRIORITY_LABEL[conditions.priority]],
  ];
  const preview = (meta?.results ?? []).slice(0, Math.min(topK, 3));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,38rem)_minmax(0,1fr)]">
      <section
        aria-label="리포트 설정"
        className="h-fit rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8"
      >
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-fg">PDF 리포트</h1>
        <p className="mt-2 text-md leading-relaxed text-fg-body">
          상위 상권과 추천·주의 근거를 상권마다 정리한 PDF를 받아 보세요. 팀이나 가족과 공유하기
          좋아요.
        </p>

        <h2 className="mt-7 text-sm font-semibold text-fg">몇 곳을 담을까요?</h2>
        <div
          role="group"
          aria-label="담을 상권 수"
          className="mt-2.5 flex gap-1.5 rounded-xl bg-surface-sunken p-1.5"
        >
          {TOP_K_OPTIONS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={topK === k}
              disabled={working}
              onClick={() => setTopK(k)}
              className={cn(
                "h-12 flex-1 rounded-lg text-md transition-colors disabled:opacity-60",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                topK === k
                  ? "bg-accent font-semibold text-accent-fg shadow-sm"
                  : "font-medium text-fg-body hover:bg-surface",
              )}
            >
              {k}곳
            </button>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-fg">지금 조건</h2>
          <Button variant="quiet" size="sm" onClick={onGoRecommend}>
            조건 바꾸기
          </Button>
        </div>
        <dl className="mt-1.5">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline gap-3 border-t border-border-subtle py-3">
              <dt className="w-24 shrink-0 text-sm text-fg-muted sm:w-28">{label}</dt>
              <dd className="min-w-0 flex-1 text-md font-semibold text-fg">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex items-start gap-2.5 rounded-lg bg-caution-subtle px-3.5 py-3 text-caution-text">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p className="text-sm font-medium leading-relaxed">
            상권마다 AI가 근거를 새로 쓰고 검증해서{" "}
            <b className="font-semibold">몇 분 걸릴 수 있고, AI 사용량이 발생해요.</b>
          </p>
        </div>

        {error ? (
          <AuthAlert tone="error" className="mt-4">
            {error}
          </AuthAlert>
        ) : null}
        {done ? (
          <AuthAlert tone="success" className="mt-4">
            PDF를 내려받았어요. 다운로드 폴더를 확인해 주세요.
          </AuthAlert>
        ) : null}

        <Button
          variant="solid"
          size="lg"
          className="mt-5 h-auto min-h-14 w-full whitespace-normal py-3"
          disabled={working}
          onClick={make}
        >
          {working ? (
            <>
              <Loader2 aria-hidden="true" className="size-5 animate-spin" />
              만드는 중… {elapsed}초 경과
            </>
          ) : (
            <>
              <Download aria-hidden="true" className="size-5" />
              PDF 만들기
            </>
          )}
        </Button>
        <p className="mt-3 text-center text-sm text-fg-muted" role="status">
          {working
            ? "창을 닫지 말고 기다려 주세요. 완성되면 자동으로 내려받아요."
            : "완성되면 자동으로 내려받아요."}
        </p>
      </section>

      <section
        aria-label="리포트 미리보기"
        className="hidden flex-col items-center gap-4 pt-1 lg:flex"
      >
        <p className="text-sm font-medium text-fg-muted">미리보기 (구성 예시)</p>
        <div className="flex aspect-[1/1.414] w-full max-w-[26rem] flex-col gap-3.5 rounded-md bg-white p-8 shadow-lg ring-1 ring-black/5">
          <div className="flex items-center gap-2">
            <LogoMark size={22} />
            <span className="font-display text-sm font-bold text-slate-900">골목 컴퍼스</span>
          </div>
          <span aria-hidden="true" className="h-[3px] w-9 rounded-full bg-gold" />
          <p className="font-display text-xl font-bold leading-snug text-slate-900">
            {bizLabel}
            <br />
            추천 상권 리포트
          </p>
          <p className="text-xs text-slate-600">
            {meta ? `데이터 기준 ${meta.as_of} · ` : ""}상위 {topK}곳
          </p>
          <ul className="mt-1">
            {preview.map((r) => (
              <li
                key={r.district_code}
                className="flex items-center gap-2.5 border-t border-slate-200 py-2 text-[13px]"
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[11px] font-bold",
                    r.rank === 1 ? "bg-gold text-brand-abyss" : "bg-slate-100 text-slate-700",
                  )}
                >
                  {r.rank}
                </span>
                <span className="flex-1 truncate font-semibold text-slate-900">{r.district_name}</span>
                <span className="font-display font-bold text-slate-900">
                  {Math.round(r.final_score)}
                </span>
              </li>
            ))}
          </ul>
          <div aria-hidden="true" className="mt-1 flex flex-col gap-2">
            {[92, 86, 90, 60].map((w) => (
              <span key={w} className="h-2 rounded-full bg-slate-200" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
