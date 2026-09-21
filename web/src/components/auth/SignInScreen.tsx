import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button, Field, FieldHint, FieldLabel, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { authErrorMessage, MIN_PASSWORD_LENGTH } from "@/lib/authErrors";
import { AUTH_REDIRECT_URL, enabledProviders, isAuthConfigured, supabase } from "@/lib/supabase";

import { AuthAlert, AuthLayout } from "./AuthLayout";
import { PasswordInput } from "./PasswordInput";
import { SocialButton } from "./SocialButton";

/* ──────────────────────────────────────────────────────────────
 * 로그인 화면 — 서비스의 첫 인상.
 *
 * 세 가지 모드를 한 화면에서 전환한다(로그인 / 가입 / 비밀번호 재설정).
 * 페이지를 나누면 라우터가 필요해지는데, 아직 그만한 화면 수가 아니다.
 * 재설정 메일의 링크를 누르고 돌아온 뒤의 "새 비밀번호" 단계는
 * UpdatePasswordScreen 이 맡는다.
 * ────────────────────────────────────────────────────────────── */

type Mode = "signin" | "signup" | "reset";
type Provider = (typeof enabledProviders)[number];

const TITLE: Record<Mode, string> = {
  signin: "로그인",
  signup: "회원가입",
  reset: "비밀번호 재설정",
};

const DESCRIPTION: Record<Mode, string> = {
  signin: "계정으로 로그인하면 분석을 시작할 수 있습니다.",
  signup: "이메일과 비밀번호만 있으면 됩니다.",
  reset: "가입한 이메일로 재설정 링크를 보내 드립니다.",
};

const SUBMIT_LABEL: Record<Mode, string> = {
  signin: "로그인",
  signup: "가입하고 시작하기",
  reset: "재설정 메일 받기",
};

export function SignInScreen() {
  const { notice: authNotice, clearNotice } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /** 가입 확인을 기다리는 이메일. 있으면 "확인 메일 다시 받기"를 띄운다. */
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const resetMessages = () => {
    setError(null);
    setNotice(null);
    setPendingEmail(null);
    clearNotice();
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    resetMessages();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || busy) return;

    setBusy(true);
    resetMessages();

    try {
      if (mode === "signin") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) {
          if (err.message.toLowerCase().includes("email not confirmed")) setPendingEmail(email);
          throw err;
        }
        // 성공하면 onAuthStateChange 가 앱을 바꾼다 — 여기서 할 일이 없다.
      } else if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: AUTH_REDIRECT_URL },
        });
        if (err) throw err;

        // 이메일 확인이 켜져 있으면 Supabase 는 이미 가입된 주소에도 오류 대신
        // "메일 보냄"과 같은 응답을 준다. 구분할 수 있는 단서는 identities 가
        // 비어 있다는 것뿐이다 — 그대로 두면 오지 않을 메일을 기다리게 된다.
        if (data.user && data.user.identities?.length === 0) {
          setError("이미 가입된 이메일입니다. 로그인하거나 비밀번호를 재설정해 주세요.");
          return;
        }

        // 이메일 확인이 꺼져 있으면 session 이 바로 오고 onAuthStateChange 가 처리한다.
        if (!data.session) {
          setPassword("");
          setPendingEmail(email);
          setNotice(`${email} 로 확인 메일을 보냈습니다. 링크를 누르면 가입이 완료됩니다.`);
        }
      } else {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: AUTH_REDIRECT_URL,
        });
        if (err) throw err;
        setNotice(`${email} 로 재설정 링크를 보냈습니다. 메일의 링크를 누르면 새 비밀번호를 정할 수 있습니다.`);
      }
    } catch (e: unknown) {
      setError(authErrorMessage(e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요."));
    } finally {
      setBusy(false);
    }
  };

  const resendConfirmation = async () => {
    if (!supabase || !pendingEmail || busy) return;

    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email: pendingEmail,
      options: { emailRedirectTo: AUTH_REDIRECT_URL },
    });
    setBusy(false);

    if (err) setError(authErrorMessage(err.message));
    else setNotice(`${pendingEmail} 로 확인 메일을 다시 보냈습니다.`);
  };

  const signInWithProvider = async (provider: Provider) => {
    if (!supabase || oauthBusy) return;

    resetMessages();
    setOauthBusy(provider);

    // 성공하면 브라우저가 provider 페이지로 떠나므로 busy 를 풀 일이 없다
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: AUTH_REDIRECT_URL },
    });
    if (err) {
      setError(authErrorMessage(err.message));
      setOauthBusy(null);
    }
  };

  const disabled = busy || oauthBusy !== null;

  return (
    <AuthLayout title={TITLE[mode]} description={DESCRIPTION[mode]}>
      {!isAuthConfigured ? (
        <ConfigNotice />
      ) : (
        <>
          {authNotice ? (
            <AuthAlert tone="error" className="mt-5">
              {authNotice}
            </AuthAlert>
          ) : null}

          <form onSubmit={submit} className="mt-7 flex flex-col gap-5">
            <Field>
              <FieldLabel>이메일</FieldLabel>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                size="lg"
              />
            </Field>

            {mode !== "reset" ? (
              <Field hint={mode === "signup"}>
                <FieldLabel
                  hint={
                    mode === "signin" ? (
                      <button
                        type="button"
                        onClick={() => switchMode("reset")}
                        className="py-1 text-sm font-medium text-accent-text hover:underline"
                      >
                        비밀번호를 잊으셨나요?
                      </button>
                    ) : undefined
                  }
                >
                  비밀번호
                </FieldLabel>
                <PasswordInput
                  name="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  // 로그인에는 길이 제한을 걸지 않는다 — 기준이 바뀌기 전에 만든
                  // 계정이 브라우저 검증에 막혀 서버에 닿지도 못하게 된다.
                  minLength={mode === "signup" ? MIN_PASSWORD_LENGTH : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? `${MIN_PASSWORD_LENGTH}자 이상` : undefined}
                />
                {mode === "signup" ? (
                  <FieldHint>{MIN_PASSWORD_LENGTH}자 이상으로 지어 주세요.</FieldHint>
                ) : null}
              </Field>
            ) : null}

            {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}
            {notice ? <AuthAlert tone="success">{notice}</AuthAlert> : null}

            {pendingEmail ? (
              <button
                type="button"
                onClick={() => void resendConfirmation()}
                disabled={disabled}
                className="self-start py-2 text-sm text-accent-text hover:underline disabled:opacity-55"
              >
                확인 메일을 못 받으셨나요? 다시 보내기
              </button>
            ) : null}

            <Button type="submit" variant="solid" size="lg" disabled={disabled}>
              {busy ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
              {SUBMIT_LABEL[mode]}
            </Button>
          </form>

          {enabledProviders.length > 0 && mode !== "reset" ? (
            <>
              <div className="my-6 flex items-center gap-3.5">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-fg-muted">또는</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <div className="flex flex-col gap-3">
                {enabledProviders.map((provider) => (
                  <SocialButton
                    key={provider}
                    provider={provider}
                    busy={oauthBusy === provider}
                    disabled={disabled}
                    onClick={() => void signInWithProvider(provider)}
                  />
                ))}
              </div>
            </>
          ) : null}

          {mode !== "reset" ? (
            <p className="mt-5 text-center text-xs leading-relaxed text-fg-muted">
              가입하거나 소셜 계정으로 계속하면{" "}
              <a href="/privacy" className="text-fg-muted underline underline-offset-2 hover:text-fg">
                개인정보처리방침
              </a>
              에 동의하는 것으로 봅니다.
            </p>
          ) : null}

          <p className="mt-6 border-t border-border-subtle pt-5 text-center text-base text-fg-body">
            {mode === "signin" ? (
              <>
                아직 계정이 없으신가요?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="font-semibold text-accent-text hover:underline"
                >
                  회원가입
                </button>
              </>
            ) : (
              <>
                {mode === "reset" ? "비밀번호가 생각나셨나요?" : "이미 계정이 있으신가요?"}{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="font-semibold text-accent-text hover:underline"
                >
                  로그인
                </button>
              </>
            )}
          </p>
        </>
      )}
    </AuthLayout>
  );
}

/* ── 환경변수가 없을 때 ────────────────────────────────────── */

function ConfigNotice() {
  return (
    <div className="mt-5 rounded-lg border border-dashed border-nodata-border bg-nodata-subtle px-4 py-4">
      <p className="text-xs font-medium text-fg">로그인 설정이 필요합니다</p>
      <p className="mt-1.5 text-2xs leading-relaxed text-fg-muted">
        <code className="font-mono">web/.env.local</code> 에{" "}
        <code className="font-mono">VITE_SUPABASE_URL</code> 과{" "}
        <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> 를 실제 값으로 채운 뒤 개발
        서버를 다시 시작하세요. 양식은 <code className="font-mono">.env.example</code> 에 있습니다.
      </p>
    </div>
  );
}
