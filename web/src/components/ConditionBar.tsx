import { ChevronDown, RotateCcw } from "lucide-react";
import { useState } from "react";

import {
  AGE_LABEL,
  AGE_OPTIONS,
  CHARACTER_LABEL,
  CHARACTER_OPTIONS,
  PRIORITY_LABEL,
  PRIORITY_OPTIONS,
} from "@/data/businessTypes";
import { fmt } from "@/lib/format";
import type { Conditions } from "@/types/domain";
import { Button, Field, FieldLabel, Select, type SelectOption } from "@/components/ui";

/* ──────────────────────────────────────────────────────────────
 * 조건 바 — 말로 정한 조건을 눈으로 확인하고, 필요하면 직접 고친다.
 *
 * 자연어 입력(물어보기 탭)이 주된 입력이지만, "지금 어떤 조건인지"가 화면에
 * 안 보이면 결과를 믿기 어렵다. 그래서 다섯 조건을 항상 라벨과 함께 펼쳐 두고,
 * 바꾸는 즉시 순위가 다시 계산된다(적용 버튼 없음).
 *
 * 값 목록은 도메인 상수(data/businessTypes.ts)와 backend 가 준 업종 목록에서만
 * 만든다 — 보증금은 프리셋이고, 자연어로 정한 값이 프리셋에 없으면 그 값을
 * 목록에 끼워 넣어 현재 조건이 항상 선택된 채로 보이게 한다.
 * ────────────────────────────────────────────────────────────── */

const BUDGET_PRESETS = [1000, 2000, 3000, 5000, 7000, 10000, 15000];

export interface ConditionBarProps {
  conditions: Conditions;
  bizOptions: readonly SelectOption[];
  busy: boolean;
  onChange: (patch: Partial<Conditions>) => void;
  onReset: () => void;
}

export function ConditionBar({ conditions, bizOptions, busy, onChange, onReset }: ConditionBarProps) {
  /* 좁은 화면에서는 다섯 칸이 첫 화면을 통째로 차지해 결과가 밀려난다. 요약 한 줄로
   * 접어 두고, 바꾸고 싶을 때만 펼친다. 넓은 화면(sm 이상)에서는 항상 펼쳐 둔다. */
  const [open, setOpen] = useState(false);
  const bizLabel = bizOptions.find((o) => o.value === conditions.biz)?.label ?? "";
  const summary = [
    bizLabel,
    `${fmt(conditions.budget)}만원 이하`,
    AGE_LABEL[conditions.age],
    CHARACTER_LABEL[conditions.character],
    PRIORITY_LABEL[conditions.priority],
  ].filter(Boolean);
  const budgets = Array.from(new Set([...BUDGET_PRESETS, conditions.budget])).sort((a, b) => a - b);
  const budgetOptions: SelectOption[] = budgets.map((v) => ({
    value: String(v),
    label: `${fmt(v)}만원 이하`,
  }));

  return (
    <section
      aria-label="탐색 조건"
      className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5"
    >
      <div className="flex items-center justify-between gap-3 sm:mb-3">
        <div className="min-w-0">
          <h2 className="text-md font-semibold text-fg">내 조건</h2>
          <p className="hidden text-xs text-fg-muted sm:block">바꾸면 순위가 바로 다시 계산돼요.</p>
        </div>
        <Button variant="quiet" size="sm" onClick={onReset} disabled={busy} className="hidden sm:inline-flex">
          <RotateCcw aria-hidden="true" className="size-4" />
          처음 조건으로
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="sm:hidden"
          aria-expanded={open}
          aria-controls="condition-fields"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "접기" : "바꾸기"}
          <ChevronDown aria-hidden="true" className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {!open ? (
        <p className="mt-2 text-sm leading-relaxed text-fg-body sm:hidden">{summary.join(" · ")}</p>
      ) : null}

      <div
        id="condition-fields"
        className={`mt-3 gap-3 sm:mt-0 sm:grid sm:grid-cols-2 xl:grid-cols-5 ${open ? "grid" : "hidden"}`}
      >
        <Field>
          <FieldLabel>업종</FieldLabel>
          <Select
            options={bizOptions}
            value={conditions.biz}
            onValueChange={(biz) => onChange({ biz })}
          />
        </Field>

        <Field>
          <FieldLabel>보증금 상한</FieldLabel>
          <Select
            options={budgetOptions}
            value={String(conditions.budget)}
            onValueChange={(v) => onChange({ budget: Number(v) })}
          />
        </Field>

        <Field>
          <FieldLabel>타깃 연령</FieldLabel>
          <Select
            options={AGE_OPTIONS}
            value={conditions.age}
            onValueChange={(age) => onChange({ age })}
          />
        </Field>

        <Field>
          <FieldLabel>상권 성격</FieldLabel>
          <Select
            options={CHARACTER_OPTIONS}
            value={conditions.character}
            onValueChange={(character) => onChange({ character })}
          />
        </Field>

        <Field>
          <FieldLabel>가장 중요한 것</FieldLabel>
          <Select
            options={PRIORITY_OPTIONS}
            value={conditions.priority}
            onValueChange={(priority) => onChange({ priority })}
          />
        </Field>

        <Button variant="quiet" size="sm" onClick={onReset} disabled={busy} className="justify-self-start sm:hidden">
          <RotateCcw aria-hidden="true" className="size-4" />
          처음 조건으로
        </Button>
      </div>
    </section>
  );
}
