import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";
import { TABS, type Tab } from "@/lib/tabs";

import { AccountMenu } from "./auth/AccountMenu";
import { ThemeToggle } from "./ThemeToggle";

/* 상단 바 — 브랜드, 주요 탭, 계정.
 *
 * 탭은 화면 폭이 넓을 때만 여기에 두고, 좁으면 아래 TabBar 로 옮긴다
 * (엄지가 닿는 자리). 업종 목록이 준비되면 온보딩 중에도 탭을 보여준다. */

export interface AppHeaderProps {
  tab: Tab;
  onTab: (tab: Tab) => void;
  showTabs: boolean;
}

export function AppHeader({ tab, onTab, showTabs }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-[80rem] items-center gap-2 px-4 sm:px-8">
        <a
          href="/"
          onClick={(e) => {
            if (!showTabs) return;
            e.preventDefault();
            onTab("recommend");
          }}
          className="flex min-w-0 shrink-0 items-center gap-2 rounded-md lg:mr-4"
          aria-label="골목 컴퍼스 — 추천 탭으로"
        >
          <LogoMark size={36} />
          <Wordmark className="text-md sm:text-xl" />
        </a>

        {showTabs ? (
          <nav aria-label="주요 메뉴" className="hidden h-full items-center lg:flex">
            {TABS.map(({ id, label }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onTab(id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-full items-center px-4 text-md transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40",
                    active ? "font-semibold text-fg" : "font-medium text-fg-muted hover:text-fg",
                    active &&
                      "after:absolute after:inset-x-4 after:bottom-0 after:h-[3px] after:rounded-t-full after:bg-accent",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        ) : null}

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
          <span aria-hidden="true" className="h-5 w-px bg-border" />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
