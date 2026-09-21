import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Input, type InputProps } from "@/components/ui";

/** 보기/숨기기 토글이 붙은 비밀번호 입력. Field 안에 두면 라벨·aria 가 자동으로 이어진다. */
export function PasswordInput(props: Omit<InputProps, "type" | "suffix">) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      size="lg"
      {...props}
      type={visible ? "text" : "password"}
      suffix={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
          aria-pressed={visible}
          className="flex size-10 items-center justify-center rounded-md text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35"
        >
          {visible ? (
            <EyeOff aria-hidden="true" className="size-5" />
          ) : (
            <Eye aria-hidden="true" className="size-5" />
          )}
        </button>
      }
    />
  );
}
