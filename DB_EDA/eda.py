"""Supabase district_features 등 실데이터 EDA.

alley_compass_etl.verification_tools.load_feature_frame(use_supabase=True)로
전체 이력을 읽어와 기초 통계·결측치·업종/분기 커버리지·상관관계를 살펴본다.
읽기만 하며 DB에는 아무것도 쓰지 않는다.
"""

from __future__ import annotations

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "alley_compass_etl"))

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

plt.rcParams["font.family"] = "AppleGothic"
plt.rcParams["axes.unicode_minus"] = False

import pandas as pd
from dotenv import load_dotenv

from verification_tools import get_supabase_client, load_feature_frame

OUT_DIR = Path(__file__).resolve().parent
pd.set_option("display.width", 140)
pd.set_option("display.max_columns", 30)

NUMERIC_COLS = [
    "foot_traffic",
    "foot_traffic_20",
    "foot_traffic_30",
    "resident_population",
    "worker_population",
    "store_count",
    "opening_rate",
    "closure_rate",
    "estimated_sales",
    "sales_growth_rate",
    "competition_density",
    "facility_count",
    "transit_score",
]


def section(title: str) -> None:
    print("\n" + "=" * 70)
    print(title)
    print("=" * 70)


def main() -> None:
    load_dotenv(REPO_ROOT / "alley_compass_etl" / ".env")

    section("1. 데이터 로딩 (district_features 전체 이력, Supabase)")
    df = load_feature_frame(use_supabase=True, latest_only=False)
    print(f"shape = {df.shape}")
    df.to_csv(OUT_DIR / "district_features_raw.csv", index=False)
    print(f"원본 저장 -> {OUT_DIR / 'district_features_raw.csv'}")

    section("2. 컬럼 / 타입")
    print(df.dtypes)

    section("3. 결측치 비율 (%)")
    missing = (df.isna().mean() * 100).round(2).sort_values(ascending=False)
    print(missing)
    missing.to_csv(OUT_DIR / "missing_ratio.csv", header=["missing_pct"])

    section("4. 분기(reference_date) 커버리지")
    by_quarter = df.groupby("reference_date").size().sort_index()
    print(by_quarter)
    by_quarter.to_csv(OUT_DIR / "rows_by_quarter.csv", header=["row_count"])

    section("5. 업종별 행 수 / store_count 분포")
    biz_col = "business_name" if "business_name" in df.columns else "business_code"
    by_biz = df.groupby(biz_col).agg(
        rows=("id", "count") if "id" in df.columns else (biz_col, "count"),
        store_count_mean=("store_count", "mean"),
        store_count_median=("store_count", "median"),
    ).round(1).sort_values("rows", ascending=False)
    print(by_biz)
    by_biz.to_csv(OUT_DIR / "rows_by_business.csv")

    section("6. 상권(district) 커버리지")
    dist_col = "district_code" if "district_code" in df.columns else None
    if dist_col:
        print(f"distinct districts = {df[dist_col].nunique()}")
        print(f"distinct (district, business) pairs = "
              f"{df[[dist_col, 'business_code']].drop_duplicates().shape[0]}")

    section("7. 주요 수치형 컬럼 describe()")
    present = [c for c in NUMERIC_COLS if c in df.columns]
    desc = df[present].describe().T
    print(desc)
    desc.to_csv(OUT_DIR / "numeric_describe.csv")

    section("8. extra_features JSONB 키 목록")
    if "extra_features" in df.columns:
        keys: set[str] = set()
        for v in df["extra_features"].dropna():
            if isinstance(v, dict):
                keys.update(v.keys())
        print(sorted(keys))

    section("9. 최신 분기 스냅샷 기준 상관관계 (수치형)")
    latest_date = df["reference_date"].max()
    latest = df[df["reference_date"] == latest_date]
    corr = latest[present].corr(numeric_only=True).round(2)
    print(f"reference_date = {latest_date}, rows = {len(latest)}")
    print(corr)
    corr.to_csv(OUT_DIR / "correlation_latest_quarter.csv")

    section("10. 앱 사용 테이블 (search_sessions / recommendation_runs / agent_analyses / verification_claims)")
    supabase = get_supabase_client()
    for table in ["search_sessions", "recommendation_runs", "agent_analyses", "verification_claims"]:
        try:
            resp = supabase.table(table).select("id", count="exact").limit(1).execute()
            print(f"{table}: count = {resp.count}")
        except Exception as exc:  # noqa: BLE001
            print(f"{table}: 조회 실패 ({exc})")

    section("11. 차트 저장")
    fig, axes = plt.subplots(2, 2, figsize=(11, 8))

    by_quarter.plot(kind="bar", ax=axes[0, 0], color="#0B4F6C")
    axes[0, 0].set_title("분기별 행 수")
    axes[0, 0].tick_params(axis="x", labelsize=7, rotation=60)

    by_biz["rows"].plot(kind="barh", ax=axes[0, 1], color="#127475")
    axes[0, 1].set_title("업종별 행 수")
    axes[0, 1].invert_yaxis()

    missing[missing > 0].plot(kind="barh", ax=axes[1, 0], color="#C1666B")
    axes[1, 0].set_title("결측치 비율 (%)")
    axes[1, 0].invert_yaxis()

    if "store_count" in latest.columns:
        latest["store_count"].dropna().plot(
            kind="hist", bins=30, ax=axes[1, 1], color="#748CAB"
        )
    axes[1, 1].set_title(f"store_count 분포 ({latest_date})")

    fig.tight_layout()
    fig.savefig(OUT_DIR / "eda_overview.png", dpi=150)
    print(f"차트 저장 -> {OUT_DIR / 'eda_overview.png'}")

    print("\nEDA 완료. 결과 파일은 DB_EDA/ 아래에 저장되어 있습니다.")


if __name__ == "__main__":
    main()
