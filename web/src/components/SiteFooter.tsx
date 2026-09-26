/* 푸터.
 *
 * 출처 표시는 지울 수 없다 — 공공누리 제1유형의 이용 조건이다.
 * 나머지(개발 단계 설명·구현 방식)는 사용자에게 필요 없는 정보라 뺐다.
 * Score 해석 주의는 남긴다. 창업 입지를 다루는 서비스라, 이 숫자를 보증으로
 * 읽으면 사용자가 실제로 손해를 볼 수 있다. */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-2 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5 sm:px-6 lg:pb-5">
        <p className="text-2xs leading-relaxed text-fg-muted">
          이 서비스의 점수는 공개 데이터를 종합한 <b className="font-medium text-fg-body">참고
          지표</b>이며, 특정 점포의 성공이나 생존을 보장하지 않습니다. 상권 단위 분석이므로 개별
          점포의 입지·운영 조건은 반영되지 않습니다.
        </p>

        <p className="text-2xs leading-relaxed text-fg-subtle">
          데이터 출처 · 서울 열린데이터광장「우리마을가게 상권분석서비스」(제공: 서울신용보증재단)
          · 공공누리 제1유형 ·{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-fg-muted">
            개인정보처리방침
          </a>
        </p>
      </div>
    </footer>
  );
}
