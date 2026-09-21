import { Clock, FileText, MessageCircle, Map as MapIcon, type LucideIcon } from "lucide-react";

/* 주요 탭. 라우터 없이 App 이 state 로 들고 있다 — 화면이 네 개뿐이고,
 * 조건 state 를 App 이 단독으로 소유하는 구조라 라우팅을 따로 둘 이유가 없다. */

export type Tab = "recommend" | "ask" | "report" | "history";

export const TABS: ReadonlyArray<{ id: Tab; label: string; icon: LucideIcon }> = [
  { id: "recommend", label: "추천", icon: MapIcon },
  { id: "ask", label: "물어보기", icon: MessageCircle },
  { id: "report", label: "리포트", icon: FileText },
  { id: "history", label: "기록", icon: Clock },
];
