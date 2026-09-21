import { lazy, Suspense, type ComponentType } from "react";

import { SignInScreen } from "./components/auth/SignInScreen";
import { LoadingScreen } from "./components/LoadingScreen";
import { UpdatePasswordScreen } from "./components/auth/UpdatePasswordScreen";
import { PrivacyPage } from "./components/legal/PrivacyPage";
import { TooltipProvider } from "./components/ui";
import { AuthProvider, useAuth } from "./lib/auth";

/* ──────────────────────────────────────────────────────────────
 * 로그인 관문.
 *
 * 이 서비스는 전체 로그인 필수다. 로그인하지 않으면 어떤 데이터도 부르지
 * 않는다 — AI 분석은 호출마다 비용이 들고, 검색 기록은 사용자별로 쌓여야
 * 하기 때문이다.
 *
 * 앱을 여는 순간 저장된 세션이 있는지 확인하는 짧은 구간이 있다. 그때
 * 로그인 화면을 먼저 그리면 이미 로그인한 사용자가 매번 로그인 화면을
 * 깜빡 보게 되므로, 확인이 끝날 때까지 중립적인 화면을 둔다.
 *
 * 비밀번호 재설정 링크로 들어온 사용자는 세션이 있어도 새 비밀번호를
 * 정하기 전까지 앱을 열지 않는다(status === "recovery").
 *
 * 앱 본체(차트·드로어·디자인 시스템 대부분)는 lazy 로 나눈다. 로그인 화면만
 * 보는 사람이 앱 전체 번들을 받을 이유가 없다.
 * ────────────────────────────────────────────────────────────── */

const App = lazy(() => import("./App"));

/* 라우터를 들이기엔 화면이 적다. 로그인 없이 열려야 하는 공개 페이지만
 * 경로로 가른다. 배포 서버는 모든 경로를 index.html 로 돌려줘야 한다
 * (web/README.md "배포" 참고). */
const PUBLIC_PAGES: Record<string, ComponentType> = {
  "/privacy": PrivacyPage,
};

function Gate() {
  const { status } = useAuth();

  if (status === "loading") return <LoadingScreen stage={0} />;
  if (status === "recovery") return <UpdatePasswordScreen />;
  if (status === "unauthenticated") return <SignInScreen />;

  return (
    <Suspense fallback={<LoadingScreen stage={1} />}>
      <App />
    </Suspense>
  );
}

export default function Root() {
  const PublicPage = PUBLIC_PAGES[window.location.pathname.replace(/\/+$/, "")];

  return (
    /* TooltipProvider 는 로그인 화면과 앱 양쪽을 덮어야 한다.
     * 앱 안에만 두면 로그인 화면의 Tooltip(테마 토글)이 provider 를 못 찾아
     * 렌더 중 throw 하고, 화면이 통째로 빈 채로 뜬다. */
    <TooltipProvider>
      {PublicPage ? (
        <PublicPage />
      ) : (
        <AuthProvider>
          <Gate />
        </AuthProvider>
      )}
    </TooltipProvider>
  );
}
