import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";
import { TABS, type Tab } from "@/lib/tabs";

import { AccountMenu } from "./auth/AccountMenu";
import { ThemeToggle } from "./ThemeToggle";

/* 상단 바 — 브랜드, 주요 탭, 계정.
 *
 * 탭은 화면 폭이 넓을 때만 여기에 두고, 좁으면 아래 TabBar 로 옮긴다
 * (엄지가 닿는 자리). 첫 조건을 받기 전(온보딩)에는 탭이 갈 곳이 없으므로
 * showTabs=false 로 숨긴다. */

export interface AppHeaderProps {
  tab: Tab;
  onTab: (tab: Tab) => void;
  showTabs: boolean;
}

export function AppHeader({ tab, onTab, showTabs }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface">
      <div className="mx-auto flex h-[4.25rem] max-w-[92rem] items-center gap-2 px-4 sm:px-6">
        <a
          href="/"
          onClick={(e) => {
            if (!showTabs) return;
            e.preventDefault();
            onTab("recommend");
          }}
          className="mr-4 flex items-center gap-2.5 rounded-md lg:mr-8"
          aria-label="골목 컴퍼스 — 추천 탭으로"
        >
          <LogoMark size={36} />
          <Wordmark className="text-xl" />
        </a>

        {showTabs ? (
          <nav aria-label="주요 메뉴" className="hidden h-full items-center md:flex">
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

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <span aria-hidden="true" className="h-5 w-px bg-border" />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
