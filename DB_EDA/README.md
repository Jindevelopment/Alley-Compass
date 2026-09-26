# DB_EDA

Supabase에 실제로 올라간 `district_features`(상권×업종×분기 feature table)를
**가공하지 않고 그대로 읽어서** 전처리가 의도대로 됐는지 검산하는 폴더다.
새 데이터를 만들지 않는다 — ETL(`alley_compass_etl/`)이 이미 만든 결과를 확인만 한다.

## 실행

저장소 루트의 `.venv`를 쓴다(`alley_compass_etl/.env`에 `SUPABASE_URL`,
`SUPABASE_SECRET_KEY`가 채워져 있어야 한다).

```bash
source .venv/bin/activate
pip install matplotlib   # 최초 1회 (backend/ETL requirements엔 없음)
python DB_EDA/eda.py
```

`district_features` 테이블 전체 이력(분기 수 × 업종 수만큼, 현재 기준 약 22만 행)을
읽어오므로 실행에 20~30초 정도 걸린다.

## 산출물

| 파일 | 내용 |
|---|---|
| `eda.py` | 실행 스크립트 (재실행하면 전부 다시 생성됨) |
| `eda_overview.png` | 분기별 행 수 / 업종별 행 수 / 결측치 비율 / store_count 분포 4분할 차트 |
| `missing_ratio.csv` | 컬럼별 결측치 비율(%) |
| `rows_by_quarter.csv` | 분기(reference_date)별 행 수 |
| `rows_by_business.csv` | 업종별 행 수·store_count 평균/중앙값 |
| `numeric_describe.csv` | 주요 수치형 컬럼의 `describe()` (평균/표준편차/사분위) |
| `correlation_latest_quarter.csv` | 최신 분기 스냅샷 기준 수치형 컬럼 상관관계 |
| `district_features_raw.csv` | 원본 전체 덤프 — **용량이 커서(약 300MB) git에는 안 올라간다**(`.gitignore`), 스크립트를 다시 돌리면 같은 파일이 재생성된다 |

## 확인된 것 (2026-09-26 기준 스냅샷)

ETL이 실제로 무엇을 하는지는 `alley_compass_etl/README.md`의 "전처리 파이프라인
한눈에 보기"를 보면 된다. 여기서는 그 결과가 **설계 의도대로 나왔는지**만 요약한다.

- **행 수 225,736** = 상권 1,641개 × 업종 10개 × 최대 18개 분기(2021Q1~2025Q2) 조합이 채워진 결과. `rows_by_quarter`/`rows_by_business` 합계가 전체 행 수와 정확히 일치하고, `id` 중복도 0건 — 업로드 로직(`upsert`, 고유키 `district_id+business_type_id+reference_date`)이 깨지지 않았다는 뜻이다.
- **`competition_density` 100% 결측** — 버그가 아니라 설계다. 상권 면적 데이터가 없어 이 컬럼은 항상 NULL로 두기로 한 결정(`alley_compass_etl/README.md` "현재 스키마와 관련된 의도적 NULL" 참고)이 그대로 반영돼 있다.
- **`estimated_sales` 43%, `sales_growth_rate` 47% 결측** — `stores LEFT JOIN sales` 조인 방식(점포는 있는데 카드매출 데이터가 없는 상권·분기를 버리지 않고 살려둠) 때문에 생기는 자연스러운 결측이다. 급증했다면 조인이 잘못됐다는 신호였겠지만, 이 비율은 매 분기 비슷하게 유지된다.
- **업종별 store_count 규모 차이가 큼**(한식음식점 중앙값 16 vs 나머지 대부분 2~7) — `backend/scoring.py`가 업종별로 다른 베이지안 축소 강도를 쓰는 이유가 실측으로 확인된다.
- **`estimated_sales` ↔ `store_count` 상관 0.89** — 매출 총량이 점포 수에 크게 좌우된다는 뜻. 개별 점포 경쟁력보다 "얼마나 많은 점포가 있는가"가 매출 규모를 지배하므로, 모델/스코어링에서 이 둘을 같은 축으로 이중 반영하지 않도록 주의해야 한다.
- **앱 실사용 테이블**(`search_sessions`, `recommendation_runs`) 734건, **`agent_analyses`/`verification_claims` 0건** — `backend/README.md`·`CLAUDE.md`에 적힌 "Agent 체인 결과가 아직 DB에 안 쌓인다"는 상태가 실측으로도 그대로 확인됨.

숫자는 데이터가 계속 쌓이면서 바뀐다 — 이 절은 스냅샷이고, 최신 값은 `python DB_EDA/eda.py`를 다시 돌려서 확인한다.
