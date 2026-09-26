import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { fetchDetail } from "@/lib/api";
import type { DetailResponse, DistrictScore } from "@/types/api";
import type { Conditions } from "@/types/domain";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Drawer,
  DrawerTitle,
} from "@/components/ui";
import { CompassArt } from "@/components/brand/CompassArt";
import { ScoreRing } from "@/components/ScoreRing";

import { CompetitionChart } from "../charts/CompetitionChart";
import { BarSeriesChart, LineSeriesChart } from "../charts/SeriesChart";
import { AgentPanel } from "./AgentPanel";
import { DiagnosticGrid } from "./DiagnosticGrid";
import { RankingFactors } from "./RankingFactors";

/* ──────────────────────────────────────────────────────────────
 * 상세 근거 드로어 (F-11, PRD §17.4).
 *
 * 세 종류의 데이터가 섞인다.
 *  · /rank 가 이미 준 값(점수·구성요소) — 즉시 표시
 *  · /detail 이 주는 값(진단·시계열)   — 열면서 조회, 과금 없음
 *  · /agents 가 주는 값(근거 문장)     — 버튼을 눌러야 조회, 과금 있음
 *
 * 순서에 의도가 있다. 위로 갈수록 "결론이 뭔가", 아래로 갈수록 "어떻게
 * 만들었나"다. 대부분은 위 절반만 읽고 닫는다.
 * ────────────────────────────────────────────────────────────── */

type DetailState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; data: DetailResponse };

export interface DistrictDrawerProps {
  r: DistrictScore | null;
  conditions: Conditions;
  modelVersion: string;
  asOf: string;
  onClose: () => void;
}

export function DistrictDrawer({
  r,
  conditions,
  modelVersion,
  asOf,
  onClose,
}: DistrictDrawerProps) {
  const [detail, setDetail] = useState<DetailState>({ status: "loading" });
  const districtCode = r?.district_code ?? null;
  const businessCode = conditions.biz;

  useEffect(() => {
    if (!districtCode || !businessCode) return;

    let cancelled = false;
    setDetail({ status: "loading" });

    fetchDetail(districtCode, businessCode)
      .then((data) => {
        if (!cancelled) setDetail({ status: "done", data });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setDetail({
          status: "error",
          message: error instanceof Error ? error.message : "알 수 없는 오류",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [districtCode, businessCode]);

  if (!r) return null;

  const score = Math.round(r.final_score);
  const isHeuristic = modelVersion.startsWith("heuristic");

  return (
    <Drawer
      open
      onOpenChange={(next) => !next && onClose()}
      title={`${r.district_name} 상세 지표`}
      header={
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={
              r.rank === 1
                ? "flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold to-gold font-display text-lg font-bold text-brand-abyss"
                : "flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-sunken font-display text-lg font-bold text-fg-body"
            }
          >
            {r.rank}
          </span>
          <div className="min-w-0">
            <DrawerTitle className="text-lg font-semibold text-fg">
              {r.district_name}
            </DrawerTitle>
            <p className="text-sm text-fg-muted">
              {detail.status === "done" ? detail.data.business_name : (r.gu_name ?? "")}
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6 px-4 py-5 sm:px-5">
        {/* 결론 — 점수 */}
        <section className="relative overflow-hidden rounded-2xl bg-[linear-gradient(120deg,var(--brand-abyss)_0%,var(--brand-deep)_70%,var(--brand-glow)_100%)] p-5 text-brand-fg sm:p-6">
          <CompassArt className="absolute -right-16 -top-20 w-64 opacity-90" />
          <div className="relative flex flex-wrap items-center gap-x-6 gap-y-4">
            <ScoreRing score={score} size={112} stroke={9} tone="onBrand" />
            <div className="min-w-0 flex-1 basis-56">
              <p className="text-lg font-semibold text-brand-fg">생존 안정성 점수</p>
              <p className="mt-1.5 max-w-[52ch] text-sm leading-relaxed text-brand-fg-muted">
                서울 골목상권 전체와 비교했을 때 이 동네에서 이 업종이 얼마나 안정적인지를
                0~100으로 나타낸 값입니다. 개별 점포의 성공 확률이 아닙니다.
              </p>
              <ScoreMethodNote isHeuristic={isHeuristic} asOf={asOf} />
            </div>
          </div>
        </section>

        <Section title="왜 이 순위인가" caption="항목별로 서울 골목상권 안에서 몇 번째인지">
          <RankingFactors breakdown={r.score_breakdown} />
        </Section>

        <Section title="이 상권, 어떻게 볼까" caption="추천 이유와 주의할 점을 함께">
          <AgentPanel districtCode={r.district_code} conditions={conditions} />
        </Section>

        {detail.status === "loading" ? (
          <p className="flex items-center gap-2 text-sm text-fg-muted" aria-live="polite">
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            상세 지표를 불러오는 중…
          </p>
        ) : null}

        {detail.status === "error" ? (
          <p className="flex items-start gap-2 text-sm text-negative-text" role="alert">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            상세 지표를 불러오지 못했습니다 — {detail.message}
          </p>
        ) : null}

        {detail.status === "done" ? (
          <>
            <Section title="상권 진단" caption="영역별 점수와 서울 내 순위">
              <DiagnosticGrid areas={detail.data.diagnostics} />
            </Section>

            <Section title="상세 지표" caption="원본 데이터 그대로">
              <div className="grid gap-3 sm:grid-cols-2">
                <ChartCard title="시간대별 유동인구" caption="상권 영역 내 체류인구">
                  <BarSeriesChart
                    series={detail.data.series.hourly}
                    unit="명"
                    label="시간대별 유동인구"
                  />
                </ChartCard>

                <ChartCard title="경쟁강도" caption="점포 1개당 배후수요 · 이 상권 vs 서울 평균">
                  <CompetitionChart data={detail.data.series.competition} />
                </ChartCard>

                <ChartCard title="분기별 추정매출" caption="점포당 월 추정매출">
                  <LineSeriesChart
                    series={detail.data.series.sales}
                    unit="만원"
                    tone="positive"
                    label="분기별 추정매출"
                  />
                </ChartCard>

                <ChartCard title="분기별 폐업률" caption="상권 내 동종업종 폐업률">
                  <LineSeriesChart
                    series={detail.data.series.closure}
                    unit="%"
                    tone="negative"
                    label="분기별 폐업률"
                  />
                </ChartCard>
              </div>
            </Section>
          </>
        ) : null}

        <p className="border-t border-border-subtle pt-3 text-xs text-fg-muted">
          데이터 기준 {asOf} · 서울 열린데이터광장
        </p>
      </div>
    </Drawer>
  );
}

/* 점수가 어떻게 나왔는지 묻는 사용자를 위한 설명.
 * 기본은 접어 둔다 — 대부분은 점수만 보고 넘어간다. 다만 열었을 때는
 * 현재 방식을 있는 그대로 적는다. 아직 학습된 예측 모델이 아니라면
 * "AI가 예측했다"고 쓰지 않는다. */
function ScoreMethodNote({ isHeuristic, asOf }: { isHeuristic: boolean; asOf: string }) {
  return (
    <details className="group mt-2">
      <summary className="inline-flex min-h-8 cursor-pointer list-none items-center gap-1 text-sm font-medium text-brand-teal underline-offset-2 hover:underline">
        점수는 어떻게 계산되나요?
      </summary>
      <p className="mt-1.5 max-w-[52ch] text-sm leading-relaxed text-brand-fg-muted">
        {isHeuristic
          ? "유동인구·배후인구·동종업종 경쟁·매출 추세·폐업 추세·교통 접근성을 서울 골목상권 전체 분포와 비교해 종합한 값입니다. 과거 데이터를 학습한 예측 모델이 아니라 현재 지표를 종합한 것이므로, 미래를 내다본 수치로 읽지 마세요."
          : "과거 상권 데이터를 학습한 모델이 폐업 위험을 추정하고, 여기에 입력하신 조건을 반영해 계산한 값입니다."}{" "}
        기준 시점은 {asOf}입니다.
      </p>
    </details>
  );
}

function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-3">
        <h4 className="text-lg font-semibold tracking-[-0.01em] text-fg">{title}</h4>
        <p className="text-sm text-fg-muted">{caption}</p>
      </div>
      {children}
    </section>
  );
}

function ChartCard({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h5" className="text-md">
          {title}
        </CardTitle>
        <p className="mt-0.5 text-sm text-fg-muted">{caption}</p>
      </CardHeader>
      <CardBody className="pb-3">{children}</CardBody>
    </Card>
  );
}
