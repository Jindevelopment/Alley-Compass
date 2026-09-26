import { cn } from "@/lib/cn";
import { TABS, type Tab } from "@/lib/tabs";

/* 모바일·태블릿 하단 탭바. lg 이상에서는 헤더의 탭이 대신한다.
 * 엄지가 닿는 자리에 두고, 아이콘만이 아니라 글자를 항상 함께 보여준다. */

export function TabBar({ tab, onTab }: { tab: Tab; onTab: (tab: Tab) => void }) {
  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgb(11_31_51/0.06)] lg:hidden"
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onTab(id)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-[4.25rem] flex-1 flex-col items-center justify-center gap-0.5 text-2xs",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40",
              active ? "font-semibold text-accent-text" : "font-medium text-fg-muted",
            )}
          >
            <Icon aria-hidden="true" className="size-6" strokeWidth={active ? 2.2 : 1.7} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
