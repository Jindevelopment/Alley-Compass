#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
골목 컴퍼스 (Alley Compass) — 사용자별 Claude 호출 한도

`/parse-condition` · `/districts/{code}/agents` · `/report` 는 전부 Claude API를
부르고, 그대로 과금된다. 로그인만 하면 통과하는 `require_user`만으로는 "이
사용자가 짧은 시간에 몇 번이나 부르게 했는가"를 막지 못한다 — 실수(새로고침
연타)든 악용이든 그대로 청구서에 반영된다.

정교한 과금 정책 대신, 호출마다 대략적인 "크레딧"을 매기고 사용자별로 1시간
슬라이딩 윈도 안의 합이 한도를 넘으면 429로 막는다.

    크레딧 = 그 호출이 실제로 부르는 Claude API 횟수의 근사치
        parse-condition   1   (구조화 출력 1회)
        agents            2   (추천 1 + 리스크 1. verify_and_correct는
                                narrative_agents 안에서 같은 두 출력을 검증하는
                                별도 호출이라 여기 포함하면 실제보다 커진다 —
                                크레딧은 "체감 비용"의 근사치면 충분하다)
        report            top_k * 2

메모리 안에서만 센다(프로세스 하나에 국한). Render 무료 플랜은 인스턴스가
하나뿐이고 15분 유휴면 재운다 — 재시작으로 카운터가 풀려도 그 시점엔 애초에
쓰던 사람이 없었다는 뜻이라 문제되지 않는다. 여러 워커·인스턴스로 수평
확장하면 이 카운터가 프로세스마다 따로 놀아 한도가 사실상 그 수만큼
늘어난다 — 그 시점엔 Redis 같은 공유 저장소로 옮겨야 한다(지금 규모에는
과한 인프라라 미룬다).
"""

from __future__ import annotations

import os
import threading
import time
from collections import defaultdict

_WINDOW_SECONDS = 3600
_lock = threading.Lock()
# bucket -> user_id -> [(호출 시각, 크레딧), ...] (윈도 안의 기록만 남긴다)
_usage: dict[str, dict[str, list[tuple[float, int]]]] = defaultdict(lambda: defaultdict(list))


def _limit_from_env(name: str, default: int) -> int:
    raw = os.getenv(name, "").strip()
    if not raw:
        return default
    try:
        value = int(raw)
    except ValueError:
        return default
    return value if value > 0 else default


# 대화형 조건 파싱 — 타이핑하며 여러 번 보낼 수 있으니 넉넉하게 둔다.
PARSE_CREDIT_LIMIT_PER_HOUR = _limit_from_env("PARSE_CREDIT_LIMIT_PER_HOUR", 60)
# 근거 생성(agents) + 리포트(report) — 상권마다 2회씩 부르므로 더 빠듯하게 둔다.
# 기본값 40이면 agents 단독 20회, 또는 top_k=5 리포트 4번 정도에 해당한다.
AGENT_CREDIT_LIMIT_PER_HOUR = _limit_from_env("AGENT_CREDIT_LIMIT_PER_HOUR", 40)


class RateLimitExceeded(Exception):
    """한도 초과. retry_after_seconds 뒤에 다시 시도하면 된다."""

    def __init__(self, retry_after_seconds: int) -> None:
        self.retry_after_seconds = retry_after_seconds
        super().__init__(f"rate limit exceeded, retry after {retry_after_seconds}s")


def _prune(entries: list[tuple[float, int]], now: float) -> list[tuple[float, int]]:
    cutoff = now - _WINDOW_SECONDS
    return [(t, c) for t, c in entries if t > cutoff]


def charge(bucket: str, user_id: str, credits: int, limit: int) -> None:
    """크레딧을 쓰기 전에 부른다. 한도를 넘기면 예외를 던지고 이번 시도는
    사용량에 반영하지 않는다 — 막힌 시도까지 깎으면 한도를 넘긴 사용자가
    영영 못 풀리는 잠금이 된다."""
    now = time.time()
    with _lock:
        entries = _prune(_usage[bucket][user_id], now)
        used = sum(c for _, c in entries)
        if used + credits > limit:
            oldest = min((t for t, _ in entries), default=now)
            retry_after = max(1, int(oldest + _WINDOW_SECONDS - now))
            _usage[bucket][user_id] = entries
            raise RateLimitExceeded(retry_after)
        entries.append((now, credits))
        _usage[bucket][user_id] = entries
