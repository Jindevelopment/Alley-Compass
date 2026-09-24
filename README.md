# 골목 컴퍼스 (Alley Compass)

> 서울 골목상권 생존 안정성 기반 AI 입지 추천 엔진 — 팀 AIM

기존 상권분석 서비스는 **장소를 먼저 고르게** 한다("연남동 어때?"). 그런데 생애 첫
창업자는 애초에 어디에 열지 모르는 상태에서 출발한다.

골목 컴퍼스는 순서를 뒤집는다. **창업자의 조건**(업종·예산·타깃·상권 성격·우선순위)을
받아 서울 골목상권 전체를 훑고, 미래 폐업위험을 예측해 검토할 만한 후보 5곳까지
좁혀준다. 추천 근거뿐 아니라 **반대 근거**도 함께 제시하고, AI가 만든 문장 속 수치는
원본 데이터 검증 Tool로 대조한 것만 남긴다.

> **AI가 설명하고, 숫자는 코드가 증명한다.**

---

## 현재 상태

| 구성 | 상태 | 위치 |
|---|---|---|
| 기획 (PRD v1.1) | ✅ | [`docs/PRD.md`](docs/PRD.md) |
| DB 스키마 | ✅ Supabase에 수동 적용 (v1.2 service_role · v1.3 로그인 · v1.4 상권 좌표 패치 포함) | [`db/schema_v1.1.sql`](db/schema_v1.1.sql) |
| 데이터 수집 (ETL) | ✅ 6개 서울시 API → Supabase 적재, 상권 좌표 보강(`district_geo.py`) | [`alley_compass_etl/`](alley_compass_etl/) |
| 검증 Tool 6종 | ✅ LLM 미사용, 결정론적 | [`alley_compass_etl/verification_tools.py`](alley_compass_etl/verification_tools.py) |
| Claude 에이전트 3종 | ✅ 추천 · 리스크 · 검증 (`claude-sonnet-5`) | [`alley_compass_etl/narrative_agents.py`](alley_compass_etl/narrative_agents.py) |
| LightGBM 예측 모델 | ✅ 실데이터(18분기 · 10개 업종)로 학습, `/rank`에 연결됨 | [`ml/`](ml/), [`backend/models/`](backend/models/) |
| FastAPI 백엔드 | ✅ 랭킹 · 조건 파싱 · 상세 진단 · 근거 생성 · PDF 리포트. `/health` 외 전부 로그인 필요, Claude 호출은 사용자별 시간당 한도 | [`backend/`](backend/) |
| 웹 프론트 | ✅ 로그인 필수(이메일 · Google · 카카오), 추천 · 물어보기 · 리포트 · 기록 탭, 카카오맵 | [`web/`](web/) |

**모델 성능** (`v-20260924-2201`, Temporal Split 테스트 구간): ROC-AUC 0.795,
Top-5% Lift 1.66배. 모델 파일이 없는 환경(로컬 개발 등)에서는 `/rank`가 원본
feature 기반 휴리스틱 Score(`heuristic-v0`)로 조용히 대체하며, 응답의
`model_version`에 어느 쪽이 쓰였는지 그대로 찍힌다.

**웹 화면에 아직 비어 있는 것** — 임차료·공실률(공개 데이터셋에 없음)은 "데이터 미보유"로
표시한다. 예산 입력은 순위에 반영되지 않는다. 자세한 건 [`web/README.md`](web/README.md).

---

## 빠른 시작

### 0. 준비 (한 번만)

Python 3.11+ 와 Node.js(npm)가 필요하다. 가상환경은 **저장소 루트에 하나만** 만든다.

```bash
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt -r alley_compass_etl/requirements.txt

cp alley_compass_etl/.env.example alley_compass_etl/.env   # 값 채우기
cp web/.env.example web/.env.local                          # 값 채우기
npm --prefix web install
```

**macOS**는 LightGBM용 OpenMP 런타임이 별도로 필요하다: `brew install libomp`. 없으면 모델을
못 불러와 `/rank`가 휴리스틱으로 조용히 대체된다(`GET /health`의 `model_version`이
`heuristic-v0`). PDF 리포트를 쓰려면 `brew install pango`도 필요하다(`backend/README.md`).

`alley_compass_etl/.env`(서버 전용)와 `web/.env.local`(공개 값만)에 무엇을 넣는지는
각 `.env.example`에 주석으로 적혀 있다.

### 1. 화면 띄우기

```bash
# 터미널 1 — 백엔드 (http://localhost:8000/docs)
cd backend && uvicorn main:app --reload --port 8000

# 터미널 2 — 웹 (http://localhost:5173)
npm --prefix web run dev
```

백엔드는 기본으로 Supabase가 아니라 로컬 CSV를 읽는다. Supabase 데이터를 쓰려면
`alley_compass_etl/.env`에 `BACKEND_USE_SUPABASE=true`를 추가한다.
로그인이 필수라 Supabase Auth 설정(`web/README.md`의 "로그인")이 먼저 필요하다.

### 2. 데이터 채우기 (필요할 때만)

준비물: [서울 열린데이터광장](https://data.seoul.go.kr) 인증키, `db/schema_v1.1.sql`을 적용한 Supabase.

```bash
cd alley_compass_etl
python alley_compass_etl.py --start-quarter 20251 --end-quarter 20251 \
  --business-name "커피-음료" --no-upload        # 시험: 업로드 없이 로컬 CSV까지만
python alley_compass_etl.py --start-quarter 20211 --end-quarter 20252 \
  --business-name "커피-음료"                     # 실제 적재
python district_geo.py --upload                   # 상권 좌표 · 구 · 면적 (지도용)
```

옵션 전체는 [`alley_compass_etl/README.md`](alley_compass_etl/README.md).
새 모델을 학습해 올리는 순서는 [`ml/README.md`](ml/README.md), 배포(Render)는
[`backend/README.md`](backend/README.md).

### 3. 확인

```bash
npm --prefix web run build        # 타입 검사 + 빌드
cd alley_compass_etl && python verification_tools.py    # 검증 Tool 데모
```

테스트 프레임워크·린터는 아직 없다.

---

## 폴더 구조

```
alley-compass/
├── README.md               이 파일
├── CLAUDE.md               Claude Code용 작업 가이드
├── Dockerfile · render.yaml   백엔드 배포(Render, Docker)
├── docs/
│   ├── PRD.md              제품 요구사항 정의서 v1.1 — 사양의 기준 문서
│   └── prototype-v0.html   React 이식 전 원본 프로토타입 (디자인 레퍼런스, 앱의 일부 아님)
├── db/schema_v1.1.sql      Supabase 스키마 + RLS (끝에 v1.2 · v1.3 · v1.4 패치 섹션)
├── alley_compass_etl/      서울시 API → 전처리 → Supabase 적재 · 검증 Tool · Agent
│   ├── alley_compass_etl.py    ETL 파이프라인
│   ├── district_geo.py         상권 좌표·구·면적 보강 (지도용)
│   ├── verification_tools.py   검증 Tool 6종 (PRD §11)
│   ├── fact_sheet.py           Feature → Agent에게 건넬 사실(Fact) 목록
│   ├── narrative_agents.py     Recommendation / Risk / Verification Agent
│   ├── condition_parser.py     자연어 → 조건 (물어보기 탭)
│   └── pipeline.py             위 전체를 잇는 CLI
├── backend/                FastAPI — 위 모듈들을 엔드포인트로 노출
│   ├── main.py · schemas.py    라우트 · 요청/응답 모델 (web/src/types/api.ts 와 1:1)
│   ├── auth.py                 Supabase 로그인 토큰(JWT) 검증
│   ├── ratelimit.py            Claude 호출 사용자별 시간당 한도
│   ├── scoring.py              랭킹 (LightGBM, 모델 없으면 휴리스틱)
│   ├── detail.py               상권 진단 4영역 + 시계열
│   ├── report.py               PDF 리포트 (WeasyPrint)
│   ├── models/                 운영에 올린 LightGBM 아티팩트 (커밋 대상)
│   └── scripts/create_user.py  운영자용 계정 생성
├── ml/                     LightGBM 학습 (PRD §14~§15) — labels · features · train
└── web/                    React 19 + TypeScript + Vite + Tailwind 4 (구조는 web/README.md)
```

---

## 설계 원칙

이 프로젝트가 다른 상권분석 서비스와 다른 지점이자, 코드를 고칠 때 지켜야 할 선이다.

**1. 숫자는 코드가 증명한다.** LLM은 집계나 확률 계산을 직접 하지 않는다. Pandas와 ML
모델이 계산한 값만 쓴다. `verification_tools.py`는 LLM을 호출하지 않는 순수 계산 코드이며
앞으로도 그래야 한다.

**2. 없는 데이터를 지어내지 않는다.** 공개 데이터셋에 상권 면적이 없으므로 면적
기반 밀도(`competition_density`)는 NULL로 둔다. 대신 면적이 필요 없는 **점포당 배후수요**
`= (유동+상주+직장) / 점포수`로 경쟁강도를 잰다. 보증금·임대료도 미보유라 예산 검증은
"산술이 맞는가"까지만 하고 `verified_by_data=False`를 남긴다. 화면에서도 비용 영역은
점수를 만들지 않고 "데이터 미보유"로 표시한다.

**3. 데이터 부족을 추정으로 메우지 않는다.** 분기가 모자라면 추세를 만들어내지 않고
`available=False`와 이유를 반환한다. QoQ 성장률은 직전 행이 실제 직전 분기일 때만 센다.

**4. 절대 점수보다 분포 내 위치.** "몇 점"보다 "서울 골목상권 중 상위 몇 %"가 의사결정에
쓸모 있다. 백분위 정의는 Python 검증 Tool과 웹이 동일하다.

**5. 프론트는 숫자를 계산하지 않는다.** 점수·백분위·진단은 전부 백엔드가 내려준 값이라
화면과 검증 Tool이 어긋나지 않는다.

---

## 데이터 출처

서울시 「우리마을가게 상권분석서비스」 (제공: 서울신용보증재단 · 서울 열린데이터광장),
공공누리 제1유형. 7개 API를 사용한다 — 길단위인구 · 점포 · 추정매출 · 집객시설 ·
직장인구 · 상주인구, 그리고 지도용 영역-상권(좌표·면적). (PRD는 직장·상주인구를 "배후 인구"
하나로 묶지만 실제 API는 2개다.)

2026-07-03 서울시 제공 기준 변경을 반영해 **2021년 이후 데이터만** 사용한다.

Score는 개별 점포 생존확률이 아니라 **상권 × 업종 단위**의 폐업위험/생존 안정성
지표다. 개인 점포 생존확률로 해석하지 않는다.
