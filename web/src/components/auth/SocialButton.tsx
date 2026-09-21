import { Loader2 } from "lucide-react";
import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

/* ──────────────────────────────────────────────────────────────
 * 소셜 로그인 버튼 — 카카오·구글 디자인 가이드를 따른다.
 *
 * 다른 버튼처럼 서비스 강조색을 입히지 않는 이유: 두 회사 모두 로그인
 * 버튼의 배경색·로고·문구를 지정해 두었고, 카카오는 비즈 앱 검수에서,
 * 구글은 OAuth 앱 게시 심사에서 이를 확인한다.
 *   카카오  #FEE500 배경 · 검은 말풍선 심볼 · "카카오 로그인"
 *   구글    흰 배경(다크: #131314) · #747775 테두리 · 4색 G 로고
 * 색은 tokens.semantic.css 의 --kakao / --google 토큰으로만 쓴다.
 * ────────────────────────────────────────────────────────────── */

export type SocialProvider = "google" | "kakao" | "github";

const LABEL: Record<SocialProvider, string> = {
  google: "Google 계정으로 계속하기",
  kakao: "카카오 로그인",
  github: "GitHub로 계속하기",
};

const SKIN: Record<SocialProvider, string> = {
  kakao: "bg-kakao text-kakao-fg hover:brightness-95 active:brightness-90",
  google: "border border-google-border bg-google text-google-fg hover:brightness-95",
  github: "border border-border bg-surface text-fg-body hover:bg-surface-sunken",
};

export interface SocialButtonProps extends Omit<ComponentPropsWithRef<"button">, "children"> {
  provider: SocialProvider;
  busy?: boolean;
}

export function SocialButton({ provider, busy = false, className, ...props }: SocialButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex h-14 w-full items-center justify-center rounded-md px-12 text-md font-semibold",
        "transition-[filter,background-color] duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
        "disabled:pointer-events-none disabled:opacity-50",
        SKIN[provider],
        className,
      )}
      {...props}
    >
      {/* 로고는 왼쪽 고정, 문구는 가운데 — 두 가이드 공통 배치 */}
      <span className="absolute left-3.5 flex size-5 items-center justify-center">
        {busy ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <ProviderLogo provider={provider} />
        )}
      </span>
      {LABEL[provider]}
    </button>
  );
}

function ProviderLogo({ provider }: { provider: SocialProvider }) {
  if (provider === "kakao") {
    return (
      <svg viewBox="0 0 18 18" aria-hidden="true" className="size-[18px]">
        <path
          fill="#000"
          d="M9 1.5C4.58 1.5 1 4.3 1 7.75c0 2.23 1.49 4.18 3.74 5.29l-.95 3.48c-.08.3.26.54.52.37l4.15-2.74c.18.02.36.02.54.02 4.42 0 8-2.8 8-6.25S13.42 1.5 9 1.5z"
        />
      </svg>
    );
  }

  if (provider === "google") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true" className="size-[18px]">
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px] fill-current">
      <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.3-.5-1.5.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z" />
    </svg>
  );
}
