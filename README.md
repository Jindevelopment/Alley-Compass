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

## 어떻게 동작하나

```
창업자 조건 (업종 · 연령 · 상권 성격 · 우선순위)
   ↓  서울 전체 상권을 업종별로 점수화 — LightGBM이 "앞으로 폐업 위험이 낮은가"를 예측
순위 목록 + 지도 (상위 후보)
   ↓  상권 하나를 고르면
진단 4영역(잠재고객 · 경쟁강도 · 영업환경 · 비용) + 시계열 그래프
   ↓  버튼을 누르면
추천 근거 · 반대 근거 — Claude가 문장을 쓰고, 문장 속 숫자는 코드가 원본 데이터로 대조
```

**처음 보시나요?** 화면부터 보려면 [빠른 시작](#빠른-시작)의 0~1단계를, 코드를 읽으려면
[폴더 구조](#폴더-구조) → 각 폴더의 `README.md` 순서로 보세요.

### 용어

| 용어 | 뜻 |
|---|---|
| 상권 | 서울시가 나눈 골목상권 1,638곳. 코드(`district_code`)로 구분한다 |
| 업종 | 카페·한식음식점처럼 서울시가 나눈 서비스 업종. 점수는 **상권 × 업종** 단위다 |
| 생존 안정성 Score | 그 상권에서 그 업종이 앞으로 안정적일 가능성(0~100점). 높을수록 좋다 |
| 휴리스틱 폴백 | LightGBM 모델 파일이 없거나 못 불러올 때 원본 지표로 대신 계산하는 임시 점수(`heuristic-v0`) |
| 승격 | 학습한 모델 파일을 `backend/models/`에 복사해 서비스가 쓰게 하는 것 |
| 검증 Tool | AI가 쓴 문장 속 숫자를 원본 데이터와 대조하는 계산 코드 6종(AI 미사용) |

---

## 빠른 시작

### 0. 준비 (한 번만)

Python 3.11+ 와 Node.js(npm)가 필요하다. 가상환경은 **저장소 루트에 하나만** 만들어
백엔드·ETL·ML이 같이 쓴다.

```bash
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt -r alley_compass_etl/requirements.txt
#  ↳ 모델 학습(ml/)까지 하려면 -r ml/requirements.txt 도 추가

cp alley_compass_etl/.env.example alley_compass_etl/.env   # 서버 전용 값 채우기
cp web/.env.example web/.env.local                          # 공개 값만 채우기
npm --prefix web install
```

**macOS**는 LightGBM용 OpenMP 런타임이 따로 필요하다: `brew install libomp`. 없으면 모델을
못 불러와 `/rank`가 휴리스틱으로 **조용히** 대체된다(`GET /health`의 `model_version`이
`heuristic-v0`). PDF 리포트는 `brew install pango`도 필요하다(`backend/README.md`).

각 `.env.example`에 어떤 값이 왜 필요한지 주석으로 적혀 있다.

### 1. 화면 띄우기

```bash
# 터미널 1 — 백엔드 (http://localhost:8000/docs), 저장소 루트에서 시작
source .venv/bin/activate          # Windows: .venv\Scripts\activate
cd backend && uvicorn main:app --reload --port 8000

# 터미널 2 — 웹 (http://localhost:5173), 저장소 루트에서 시작
npm --prefix web run dev
```

⚠️ **새 터미널을 열 때마다 `source .venv/bin/activate`를 먼저 한다.** 프롬프트 앞에 `(.venv)`가
보이면 켜진 것이다. 안 켜면 `zsh: command not found: uvicorn`이 나온다 — 설치가 안 된 게 아니라
가상환경이 꺼져 있는 것이다. (웹 터미널은 Python이 필요 없어 활성화하지 않아도 된다.)

백엔드는 기본으로 로컬 CSV를 읽는다. Supabase 데이터를 쓰려면
`alley_compass_etl/.env`에 `BACKEND_USE_SUPABASE=true`를 추가한다. 로그인이 필수라
Supabase Auth 설정([`web/README.md`](web/README.md)의 "로그인")이 먼저 필요하다.

조건을 바꾸면 서버가 서울 전체를 다시 랭킹하고, 상권 행을 누르면 진단 4영역과
시계열이 담긴 상세 패널이 열린다. 추천·반대 근거는 Claude 호출이라 버튼을
눌러야 생성된다(15~20초, 과금).

### 2. 데이터 채우기 (필요할 때만)

준비물: ① [서울 열린데이터광장](https://data.seoul.go.kr) 인증키 ② Supabase 프로젝트에
`db/schema_v1.1.sql` 적용

```bash
cd alley_compass_etl
# 먼저 1분기 × 1업종으로, 업로드 없이 시험
python alley_compass_etl.py --start-quarter 20251 --end-quarter 20251 \
  --business-name "커피-음료" --no-upload

python verification_tools.py      # 검증 Tool 데모
python district_geo.py --upload   # 상권 좌표·구·면적 (지도용) — 새 업종을 적재했다면 다시 실행
```

옵션 전체는 [`alley_compass_etl/README.md`](alley_compass_etl/README.md), 모델 학습·승격은
[`ml/README.md`](ml/README.md), 배포(Render)는 [`backend/README.md`](backend/README.md).

### 3. 확인

테스트 프레임워크·린터는 아직 없다. `npm --prefix web run build`(타입 검사 포함),
`cd backend && python -c "import main"`, ETL의 DATA QUALITY REPORT로 확인한다.

---

## 현재 상태

핵심 기능은 실 데이터로 동작하고 배포까지 돼 있다. 남은 일은 AI 근거 문장을 DB에
쌓는 것, 예측 이유를 설명하는 기능(SHAP), 임차료 데이터 편입 여부 정도다.

| 구성 | 상태 | 위치 |
|---|---|---|
| 기획 (PRD v1.1) | ✅ | [`docs/PRD.md`](docs/PRD.md) |
| DB 스키마 | ✅ Supabase에 수동 적용 (v1.2~v1.4 패치: service_role · 로그인 · 상권 면적) | [`db/schema_v1.1.sql`](db/schema_v1.1.sql) |
| 데이터 수집 (ETL) | ✅ 2021Q1~2025Q2(18개 분기). 외식업 10종 중 9종(패스트푸드점 제외) + 생활업종 일부 | [`alley_compass_etl/`](alley_compass_etl/) |
| 상권 좌표·구·면적 | ✅ 서울시 "영역-상권" API — 중심점과 면적만 주며 다각형은 아니다 | [`district_geo.py`](alley_compass_etl/district_geo.py) |
| 검증 Tool 6종 | ✅ 결정론적 계산, AI 미사용 | [`verification_tools.py`](alley_compass_etl/verification_tools.py) |
| Claude 에이전트 3종 | ✅ 추천 · 리스크 · 검증. 근거는 화면에만 표시하고 DB엔 아직 안 쌓는다 | [`narrative_agents.py`](alley_compass_etl/narrative_agents.py) |
| 자연어 조건 입력 | ✅ 문장을 조건으로 바꿔 준다(이전 대화 조건 이어받음) | `POST /parse-condition` |
| LightGBM 모델 | ✅ 22.5만 행(10개 업종 × 18개 분기)으로 학습·배포 | [`ml/`](ml/), [`backend/models/`](backend/models/) |
| FastAPI 백엔드 | ✅ 랭킹·조건 파싱·상세 진단·근거 생성·PDF 리포트. `/health` 외 로그인 필요 | [`backend/`](backend/) |
| 백엔드 배포 | ✅ Render(Docker) 무료 플랜. 메모리 한도 때문에 최신 분기만, 그것도 고른 업종만 올려 둔다 | [`Dockerfile`](Dockerfile), [배포 안내](backend/README.md#배포-render) |
| 웹 프론트 | ✅ 로그인 필수(이메일·Google·카카오), 추천·물어보기·리포트·기록 탭, 카카오맵 | [`web/`](web/) |
| 보증금·임대료 | ❌ 없음 — 한국부동산원 R-ONE 자료는 전국 368개 대표 상권 단위라 서울 골목상권과 안 맞아 넣지 않았다 | 설계 원칙 2 |

**화면의 숫자는 전부 실제 데이터다.** 임차료만 데이터가 없어 "데이터 미보유"로 비워 두고,
입력받는 예산은 순위에 반영하지 않는다. 자세한 건 [`web/README.md`](web/README.md)의
"지금 진짜인 것 / 아직 아닌 것" 표를 본다.

**알아두면 좋은 결정 세 가지**
- **모델이 없으면 조용히 대체한다.** LightGBM 파일을 못 불러오면 서버가 죽지 않고 휴리스틱 점수로
  계산한다. 응답의 `model_version`(`lightgbm-…` / `heuristic-v0`)이 어느 쪽인지 알려 주니,
  배포 후엔 `GET /health`로 확인한다.
- **순위는 안정성 + 타깃 적합도의 가중합이다.** 사용자가 고른 상권 성격·연령대가 순위에
  실제로 반영된다(PRD §16). 자세한 구성은 [`backend/README.md`](backend/README.md#모델-버전).
- **학습 데이터의 두 가지 편향을 보정했다.** 코로나 시기(2021~2022) 라벨 왜곡은 학습에서 그 구간을
  빼 해결했고, 점포가 1~2개뿐인 상권이 "안정적"으로 과대평가되는 문제는 서빙 단계에서
  업종별 점포수 중앙값 쪽으로 점수를 끌어당겨 완화했다. 근거는 [`ml/README.md`](ml/README.md).

---

## 폴더 구조

```
alley-compass/
├── README.md               이 파일
├── CLAUDE.md               Claude Code용 작업 가이드
├── Dockerfile · render.yaml   백엔드 배포(Render, Docker)
├── docs/
│   ├── PRD.md              제품 요구사항 정의서 v1.1 — 사양의 기준 문서
│   └── prototype-v0.html   React 이식 전 원본 프로토타입 (디자인 레퍼런스)
├── db/
│   └── schema_v1.1.sql     Supabase/PostgreSQL 스키마 (테이블 11개 + RLS)
│                             끝에 v1.2(service_role) · v1.3(로그인) · v1.4(상권 면적) 패치 섹션
├── DB_EDA/                 Supabase 실데이터 검산 (전처리가 의도대로 됐는지 확인)
│   ├── eda.py                    결측치·분포·상관관계 리포트 + 차트 생성
│   └── README.md                 산출물 설명 · 확인된 결과 스냅샷
├── alley_compass_etl/      서울시 Open API → 전처리 → Supabase 적재 → Agent
│   ├── alley_compass_etl.py    ETL 파이프라인
│   ├── district_geo.py          상권 좌표/구/면적 보강 (지도 표시용, "영역-상권" API)
│   ├── condition_parser.py      자연어 문장 → 조건(ParsedCondition) 구조화 출력
│   ├── verification_tools.py   검증 Tool 6종 (PRD §11)
│   ├── fact_sheet.py            Feature → Agent에게 건넬 사실(Fact) 목록 생성
│   ├── narrative_agents.py      Recommendation/Risk/Verification Agent (Claude)
│   ├── pipeline.py               위 전체를 잇는 CLI (--dry-run 지원)
│   └── README.md               ETL·Agent 사용법 · 의도적 NULL 설명
├── backend/                FastAPI — 위 모듈들을 엔드포인트로 노출
│   ├── main.py                  /rank, /parse-condition, /districts/{code}/detail, /agents, /report
│   ├── auth.py                   Supabase 로그인 토큰(JWT) 검증
│   ├── scoring.py                랭킹 로직 — LightGBM 승격돼 있으면 우선 사용, 없으면 휴리스틱 폴백
│   ├── detail.py                 상권 진단 4영역 + 시계열 집계
│   ├── report.py                 PDF 리포트 (WeasyPrint)
│   ├── ratelimit.py              Claude 호출 엔드포인트 사용자별 시간당 크레딧 한도
│   ├── models/                   승격된 LightGBM 아티팩트(*.joblib) — 커밋 대상
│   ├── schemas.py                요청·응답 모델 (web/src/types/api.ts 와 1:1)
│   ├── scripts/create_user.py    운영자용 계정 생성
│   └── README.md
├── ml/                     LightGBM 생존 안정성 모델 (PRD §14~§15)
│   ├── labels.py                 Label 정의 (PRD §7.1)
│   ├── features.py               Feature 목록
│   ├── train.py                  Temporal Split 학습·평가 (--train-start-quarter로 학습 구간 제외 가능)
│   └── README.md
└── web/                    React 19 + TypeScript + Tailwind 4 프론트엔드
    ├── src/Root.tsx        로그인 관문 · 공개 페이지(/privacy) 분기
    ├── src/App.tsx         메인 화면 — 조건 state 소유 · API 호출 조립
    ├── src/components/
    │   ├── ui/             자체 디자인 시스템 (Radix 기반)
    │   ├── auth/           로그인 · 가입 · 비밀번호 재설정 · 소셜 버튼 · 계정 메뉴
    │   ├── detail/         상권 상세 드로어 (진단 · 점수 구성 · AI 근거)
    │   ├── charts/         시계열 · 경쟁강도 차트
    │   ├── tabs/           추천 · 물어보기 · 리포트 · 기록 (주요 탭 4개)
    │   ├── legal/          개인정보처리방침
    │   ├── RankMap.tsx     카카오맵 — 면적 비례 원 + 순위 배지 + 호버 툴팁
    │   └── OnboardingChat.tsx / ChatLog.tsx   자연어 조건 입력 (첫 방문 전체화면 → 사이드바로 축소)
    ├── src/lib/            api.ts(백엔드 유일 접점) · supabase.ts · auth.tsx · kakaoMaps.ts · conditionsStorage.ts · historyStorage.ts
    ├── src/types/          api.ts(backend/schemas.py 와 1:1) · 도메인 · UI 어휘
    ├── src/styles/         디자인 토큰 3계층 (재료 → 역할 → Tailwind)
    └── README.md           구조 · 로그인 · 토큰 추가 방법 · 접근성 규칙
```

---

## 설계 원칙

이 프로젝트가 다른 상권분석 서비스와 다른 지점이자, 코드를 고칠 때 지켜야 할 선이다.

**1. 숫자는 코드가 증명한다.** LLM은 집계나 확률 계산을 직접 하지 않는다. Pandas와 ML
모델이 계산한 값만 쓴다. `verification_tools.py`는 LLM을 호출하지 않는 순수 계산 코드이며
앞으로도 그래야 한다.

**2. 없는 데이터를 지어내지 않는다.** 5종 공개 데이터셋에 상권 면적이 없으므로 면적
기반 밀도(`competition_density`)는 NULL로 둔다. 대신 면적이 필요 없는 **점포당 배후수요**
`= (유동+상주+직장) / 점포수`로 경쟁강도를 잰다. 보증금·임대료도 미보유라 예산 검증은
"산술이 맞는가"까지만 하고 `verified_by_data=False`를 남긴다. 화면에서도 비용 영역은
점수를 만들지 않고 "데이터 미보유"로 표시한다.

**3. 데이터 부족을 추정으로 메우지 않는다.** 분기가 모자라면 추세를 만들어내지 않고
`available=False`와 이유를 반환한다. QoQ 성장률은 직전 행이 실제 직전 분기일 때만 센다.

**4. 절대 점수보다 분포 내 위치.** "몇 점"보다 "서울 골목상권 중 상위 몇 %"가 의사결정에
쓸모 있다. 백분위 정의는 Python 검증 Tool과 웹이 동일하다.

---

## 데이터 출처

서울시 「우리마을가게 상권분석서비스」 (제공: 서울신용보증재단 · 서울 열린데이터광장),
공공누리 제1유형. 6개 API를 사용한다 — 길단위인구 · 점포 · 추정매출 · 집객시설 ·
직장인구 · 상주인구. (PRD는 뒤 둘을 "배후 인구" 하나로 묶지만 실제 API는 2개다.)
상권 좌표/구/면적은 별도 API인 "영역-상권"(TbgisTrdarRelm)에서 가져온다 — 중심점
좌표와 면적만 제공하며 다각형 경계는 아니다.

2026-07-03 서울시 제공 기준 변경을 반영해 **2021년 이후 데이터만** 사용한다.
현재 2021Q1~2025Q2(18개 분기)를 수집했고, 외식업(CS1) 10개 세부업종 중
9개(한식·중식·일식·양식·제과점·치킨·분식·호프-간이주점·커피-음료 — 패스트푸드점
제외, Supabase 무료 티어 저장 용량 여유를 남기기 위한 선택) + 그 외 생활밀접업종
일부를 담고 있다.

보증금·임대료는 여전히 미보유다. 한국부동산원 R-ONE(부동산통계정보시스템)의
"상업용부동산 임대동향조사"에 실제 보증금/임대료 데이터가 있지만, 전국 368개
"대표 상권" 단위라 서울시 자체의 1,638개 골목상권(`상권_코드`) 체계보다 훨씬
거칠어서 — 정밀도를 지어내지 않기 위해 편입하지 않기로 했다.

Score는 개별 점포 생존확률이 아니라 **상권 × 업종 단위**의 폐업위험/생존 안정성
지표다. 개인 점포 생존확률로 해석하지 않는다.
