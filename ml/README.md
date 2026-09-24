# 골목 컴퍼스 — LightGBM 생존 안정성 모델

PRD §7, §14, §15 구현. `alley_compass_etl/`이 만드는 `district_features`
다분기 패널을 입력으로, 상권×업종의 향후 생존 안정성을 예측한다.

## 지금 상태

실데이터(225,736행 · 18분기 · 10개 업종)로 학습한 모델 `v-20260924-2201`이
`backend/models/`에 올라가 `/rank`에서 쓰이고 있다. Temporal Split 테스트 구간
성능은 ROC-AUC 0.795, Top-5% Lift 1.66배.

Temporal Split(과거 학습 → 미래 검증, PRD §15)과 Label(§7.1, "향후 N분기 실적")은
여러 시점의 데이터가 있어야 의미가 생기므로, 학습하려면 먼저 ETL로 다분기 데이터를
Supabase에 적재해야 한다(`alley_compass_etl/README.md`).

## 사용법

`ml/`에서 루트 가상환경을 켠 채 실행한다. 학습 전용 의존성(scikit-learn · shap 등)은
`ml/requirements.txt`에 따로 있다.

```bash
pip install -r requirements.txt

# 1) 배관 점검 — API 키·데이터 불필요. 합성 데이터라 성능 수치는 의미 없고
#    model_versions 저장도 거부된다(is_synthetic 체크).
python train.py --synthetic

# 2) 실제 학습 — 2021~22 학습, 2023 검증, 2024~ 테스트
python train.py --supabase \
  --train-end-quarter 20224 --val-end-quarter 20234 --save-to-supabase
```

`--train-end-quarter`/`--val-end-quarter`는 `YYYYQ` 형식(예: `20224` = 2022년 4분기)이며,
그 이후 분기는 자동으로 테스트 구간이 된다. 로컬 CSV로 하려면 `--csv <경로>`.

## Label 정의 (PRD §7.1, `labels.py`)

PRD가 제시한 4개 후보 중 ④(폐업률·매출 안정성 결합)에 ①(향후 폐업률 증가
여부)의 관점을 더해 채택했다:

```
label_unstable = 1  if  향후 H분기 평균 폐업률 > 같은 시점·업종 상권 중앙값 * 1.15
                     or  향후 H분기 평균 매출성장률 < -5%
               = 0  otherwise
```

라벨은 미래 시점 값만, feature는 그 이전 값만 쓴다(look-ahead 방지). 미래
구간이 없는 마지막 H개 분기는 라벨을 만들지 않고 학습에서 제외한다 —
추정으로 채우지 않는다(루트 README 설계원칙 3).

다른 정의로 바꾸고 싶으면 `labels.py`의 `DEFAULT_CLOSURE_MARGIN` /
`DEFAULT_SALES_DECLINE` / `DEFAULT_HORIZON_QUARTERS`를 조정하거나
`build_labels()`를 교체하면 된다 — `features.py`/`train.py`는 그대로 쓸 수
있다.

## 평가지표 (PRD §15)

`train.py`가 Train/Validation/Test 세 구간에 대해 각각 계산한다.

| 지표 | 의미 |
|---|---|
| ROC-AUC | 안정 상권과 위험 상권을 얼마나 잘 구분하는지 |
| PR-AUC | 위험(양성) 클래스가 적을 때(Class Imbalance) 성능 |
| Brier Score | 예측 확률과 실제 결과의 오차 |
| Calibration Error | "70% 위험"이라 한 집단의 실제 위험 발생률이 70%에 가까운지 |
| Top-K Lift | 모델이 추천한 상위 K(기본 5%)의 실제 안정 비율이 전체 평균보다 높은지 |

## 새 모델을 서비스에 올리기 (승격)

1. 위 2)로 학습하면 `ml/models/<version>.joblib`이 생기고(`ml/models/`의 `*.joblib`은
   gitignore 대상), `--save-to-supabase`면 지표·기간·feature importance가
   `model_versions`에 남는다.
2. 지표를 확인하고 쓸 만하면 그 파일을 `backend/models/<version>.joblib`로 **복사해 커밋**한다.
   `backend/models/`만 Docker 이미지에 실린다.
3. 백엔드는 이 폴더에서 **파일명이 가장 늦은** `.joblib`을 쓴다(`v-YYYYMMDD-HHMM` 형식이라
   문자열 정렬이 곧 시간 정렬). 이전 버전 파일은 롤백용으로 남겨도 되지만,
   롤백하려면 새 파일을 지워야 한다.
4. 배포 후 `GET /health`의 `model_version`이 `lightgbm-<version>`인지 확인한다.
   `heuristic-v0`면 모델 로드에 실패해 폴백 중이라는 뜻이다(서버 로그에 `[경고] LightGBM 모델 로드 실패`).

피처 목록은 아티팩트 안에 같이 저장돼 있어 백엔드가 `ml/`을 import하지 않는다.
`features.py`의 `FEATURE_COLUMNS`를 바꾸면 반드시 다시 학습해서 승격한다.
