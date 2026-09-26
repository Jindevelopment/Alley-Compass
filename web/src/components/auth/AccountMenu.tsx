import { LogOut, UserRound } from "lucide-react";
import { useState } from "react";

import { avatarUrl, displayName, useAuth } from "@/lib/auth";
import { Button, Tooltip } from "@/components/ui";

/* 헤더의 계정 영역. 지금은 사진 + 이름 + 로그아웃뿐이다.
 * 프로필·결제·저장한 상권이 생기면 여기를 드롭다운으로 바꾼다. */
export function AccountMenu() {
  const { user, signOut } = useAuth();
  const [imageFailed, setImageFailed] = useState(false);
  if (!user) return null;

  const name = displayName(user);
  const avatar = imageFailed ? null : avatarUrl(user);

  return (
    <div className="flex items-center gap-2">
      <Tooltip content={user.email ?? name}>
        <span className="hidden items-center gap-2 xl:flex">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              // 구글 프로필 사진은 referrer 가 붙으면 403 을 줄 때가 있다
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
              className="size-6 rounded-full border border-border object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-6 items-center justify-center rounded-full bg-surface-sunken text-fg-subtle"
            >
              <UserRound className="size-3.5" />
            </span>
          )}
          <span className="hidden max-w-[10rem] truncate text-xs text-fg-body sm:inline">
            {name}
          </span>
        </span>
      </Tooltip>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => void signOut()}
        aria-label="로그아웃"
      >
        <LogOut aria-hidden="true" className="size-3.5" />
      </Button>
    </div>
  );
}
