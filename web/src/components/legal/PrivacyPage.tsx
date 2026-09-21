import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardBody } from "@/components/ui";

import { ThemeToggle } from "../ThemeToggle";

/* ──────────────────────────────────────────────────────────────
 * 개인정보처리방침 — /privacy
 *
 * 로그인 없이 열려야 한다. 구글 OAuth 앱 게시와 카카오 비즈 앱 전환이
 * 이 주소를 요구하고, 가입 전에 읽을 수 있어야 동의의 의미가 있다.
 *
 * 여기 적힌 내용은 코드의 실제 동작과 같아야 한다. 바꿀 때 함께 볼 곳:
 *   수집 항목    lib/auth.tsx · db/schema_v1.1.sql 의 profiles / search_sessions
 *   파기         search_sessions.user_id on delete set null (v1.3 ③)
 *   외부 전송    backend/main.py 의 /agents — Claude 에 사용자 정보를 넣지 않는다
 *
 * ⚠️ 공개 전에 OPERATOR 를 실제 값으로 채우고, 가능하면 법률 검토를 받는다.
 * ────────────────────────────────────────────────────────────── */

const OPERATOR = {
  name: "골목 컴퍼스 운영팀",
  /** 개인정보 보호책임자 문의 창구. 공개 전에 실제 주소로 바꾼다. */
  contact: "privacy@alleycompass.example",
};

const EFFECTIVE_DATE = "2026년 9월 19일";

export function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="flex items-center justify-between px-4 py-3 sm:px-6">
        <a
          href="/"
          className="flex items-center gap-1.5 rounded-sm text-xs text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          골목 컴퍼스로 돌아가기
        </a>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 sm:px-6">
        <h1 className="mt-4 text-2xl font-semibold text-fg">개인정보처리방침</h1>
        <p className="mt-2 text-xs text-fg-muted">
          {OPERATOR.name}(이하 “운영자”)은 골목 컴퍼스 서비스를 제공하면서 필요한 최소한의
          개인정보만 처리합니다. 시행일 {EFFECTIVE_DATE}.
        </p>

        <Card className="mt-6">
          <CardBody className="flex flex-col gap-7 pt-5">
            <Section title="1. 처리하는 개인정보">
              <Table
                head={["구분", "항목", "수집 방법"]}
                rows={[
                  ["이메일 가입", "이메일 주소, 비밀번호(암호화 저장 — 운영자도 원문을 볼 수 없음)", "가입 화면에 직접 입력"],
                  ["소셜 로그인", "이메일 주소, 이름(닉네임), 프로필 사진", "Google · 카카오가 이용자 동의 후 제공"],
                  ["서비스 이용", "입력한 분석 조건(업종 · 예산 · 타깃 연령 · 상권 성격 · 우선순위), 조회 시각", "분석을 요청할 때 자동 저장"],
                  ["자동 생성", "로그인 기록, 접속 IP 등 서비스 운영 로그", "서비스 이용 과정에서 생성"],
                ]}
              />
              <p>
                상권 분석 결과(점수 · 순위)는 서울시 공공데이터로 계산하며, 이용자 개인에 대한
                정보가 아닙니다.
              </p>
            </Section>

            <Section title="2. 이용 목적">
              <ul className="list-disc space-y-1 pl-5">
                <li>로그인과 본인 확인, 가입 확인 · 비밀번호 재설정 메일 발송</li>
                <li>조건에 맞는 상권 분석 결과 제공</li>
                <li>분석 조건 기록을 통계로 모아 추천 품질과 예측 모델 개선</li>
                <li>문의 응대, 부정 이용 방지</li>
              </ul>
            </Section>

            <Section title="3. 보유 기간과 파기">
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <b className="font-medium text-fg">계정 정보</b>(이메일 · 이름 · 사진)는 탈퇴하는
                  즉시 삭제합니다.
                </li>
                <li>
                  <b className="font-medium text-fg">분석 조건 기록</b>은 탈퇴 시 계정과의 연결을
                  끊어, 누구의 기록인지 알 수 없는 상태로만 통계 · 모델 개선에 이용합니다.
                </li>
                <li>법령이 보관을 요구하는 정보는 그 기간 동안만 분리 보관한 뒤 파기합니다.</li>
              </ul>
            </Section>

            <Section title="4. 제3자 제공">
              <p>
                운영자는 이용자의 개인정보를 제3자에게 제공하지 않습니다. “추천 이유 생성” 기능은
                AI(Anthropic Claude)를 이용하지만, 이때 전달되는 것은 상권 통계와 선택한 분석
                조건뿐이며 이메일 · 이름 등 이용자를 알아볼 수 있는 정보는 전달하지 않습니다.
              </p>
            </Section>

            <Section title="5. 처리 위탁 및 국외 이전">
              <Table
                head={["수탁자 (국가)", "위탁 업무", "이전 항목"]}
                rows={[
                  ["Supabase Inc. (미국)", "회원 인증, 데이터베이스 저장", "1번의 모든 항목"],
                  ["Google LLC (미국)", "가입 확인 · 비밀번호 재설정 메일 발송", "이메일 주소"],
                ]}
              />
              <p>
                이전은 서비스 이용 시 네트워크를 통해 이루어지며, 보유 기간은 3번과 같습니다.
                국외 이전을 원하지 않으면 가입하지 않거나 탈퇴할 수 있으나, 이 경우 서비스를
                이용할 수 없습니다.
              </p>
            </Section>

            <Section title="6. 이용자의 권리">
              <p>
                이용자는 언제든 자신의 개인정보 열람 · 정정 · 삭제 · 처리 정지와 탈퇴를 요청할 수
                있습니다. 아래 문의처로 요청하면 지체 없이 처리하고 결과를 알려 드립니다.
              </p>
            </Section>

            <Section title="7. 안전성 확보 조치">
              <ul className="list-disc space-y-1 pl-5">
                <li>비밀번호 단방향 암호화 저장, 모든 통신 암호화(HTTPS)</li>
                <li>데이터베이스 행 단위 접근 통제 — 이용자는 본인 기록만 조회 가능</li>
                <li>관리용 키는 서버에만 두고 접근 권한을 최소화</li>
              </ul>
            </Section>

            <Section title="8. 브라우저 저장소">
              <p>
                로그인 상태 유지를 위해 브라우저 저장소(localStorage)에 로그인 토큰을, 화면
                설정(라이트 · 다크)을 저장합니다. 또한 다음 접속 때 이어서 볼 수 있도록 마지막으로
                입력한 분석 조건과, &quot;기록&quot; 화면에 보여줄 최근 분석 기록(조건, 1위 상권 이름과
                점수)을 이 브라우저에만 저장합니다. 이 기록은 서버로 보내지 않으며, 기록 화면의
                &quot;기록 모두 지우기&quot;로 언제든 지울 수 있습니다. 광고 · 추적 목적의 쿠키는 쓰지
                않습니다. 로그아웃하면 로그인 토큰이 지워집니다.
              </p>
            </Section>

            <Section title="9. 개인정보 보호책임자 및 문의">
              <p>
                {OPERATOR.name} ·{" "}
                <a
                  href={`mailto:${OPERATOR.contact}`}
                  className="text-accent-text underline underline-offset-2"
                >
                  {OPERATOR.contact}
                </a>
              </p>
              <p>
                개인정보 침해 신고 · 상담은 개인정보침해신고센터(privacy.kisa.or.kr, 국번 없이
                118), 개인정보분쟁조정위원회(kopico.go.kr, 1833-6972)에도 할 수 있습니다.
              </p>
            </Section>

            <Section title="10. 변경 안내">
              <p>이 방침이 바뀌면 시행 7일 전부터 서비스 화면으로 알립니다.</p>
            </Section>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-fg">{title}</h2>
      <div className="mt-2 flex flex-col gap-2 text-xs leading-relaxed text-fg-body">
        {children}
      </div>
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[32rem] border-collapse text-left text-xs">
        <thead className="bg-surface-sunken text-fg">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-t border-border-subtle">
              {row.map((cell, i) => (
                <td key={i} className="px-3 py-2 align-top text-fg-body">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
