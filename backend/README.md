# 골목 컴퍼스 API

`alley_compass_etl/`의 검증 로직(fact_sheet.py, narrative_agents.py,
verification_tools.py)을 그대로 재사용하는 FastAPI 백엔드. 새 판정 로직을
여기서 다시 만들지 않는다 — 있는 걸 노출만 한다.

## 실행

conda 없이 표준 `venv`로 실행한다. 가상환경은 저장소 루트에 하나만 만들면 된다 —
`backend/main.py`가 `alley_compass_etl` 모듈을 그대로 import하므로, `backend/`
것만 설치하면 `ModuleNotFoundError`가 난다. 두 `requirements.txt`를 함께 설치한다.

```bash
# 저장소 루트에서
python3 -m venv .venv
source .venv/bin/activate        # Windows는 .venv\Scripts\activate

pip install -r backend/requirements.txt -r alley_compass_etl/requirements.txt

cd backend
cp ../alley_compass_etl/.env.example ../alley_compass_etl/.env   # 처음 한 번, 값 채우기
uvicorn main:app --reload --port 8000
```

다음부터 백엔드만 다시 띄울 때는 저장소 루트에서 `source .venv/bin/activate`로 가상환경을
켠 뒤 `cd backend && uvicorn main:app --reload --port 8000`이면 된다. 새 터미널을 열면
가상환경이 꺼져 있으니 매번 켠다 — 안 켜면 `command not found: uvicorn`이 나온다.

기본은 로컬 CSV(`alley_compass_etl/data/processed/district_features_debug.csv`)를
읽는다. Supabase로 전환하려면 `alley_compass_etl/.env`에

```
BACKEND_USE_SUPABASE=true
```

를 추가한다 (단, `db/schema_v1.1.sql`의 v1.2 패치 — `service_role` GRANT —
가 먼저 Supabase에 적용돼 있어야 한다).

http://localhost:8000/docs 에서 Swagger UI로 바로 테스트 가능(로그인 토큰 필요).

### 환경변수

전부 `alley_compass_etl/.env`에 둔다. 설명은 `.env.example`에 주석으로 있다.

| 변수 | 용도 |
|---|---|
| `SUPABASE_URL` · `SUPABASE_SECRET_KEY` | DB 조회 · 로그인 토큰 검증 (서버 전용 키) |
| `SUPABASE_JWT_SECRET` | 구형(HS256) 프로젝트만 |
| `ANTHROPIC_API_KEY` | `/parse-condition` · `/agents` · `/report` |
| `BACKEND_USE_SUPABASE` | `true`면 Supabase, 기본은 로컬 CSV |
| `CORS_ORIGINS` | 허용할 웹 주소(쉼표 구분). 기본 `http://localhost:5173` |
| `PARSE_CREDIT_LIMIT_PER_HOUR` · `AGENT_CREDIT_LIMIT_PER_HOUR` | Claude 호출 한도 (기본 60 · 40) |
| `FRAME_CACHE_TTL_SECONDS` | 업종별 상권 데이터 캐시 갱신 주기 (기본 21600 = 6시간) |

운영자가 계정을 직접 만들 때는 `backend/`에서 `python scripts/create_user.py <이메일>`.

## 배포 (Render)

Vercel(프론트)과 별개로 백엔드는 Render에 Docker로 올린다. Vercel의 기본
Python 서버리스 런타임은 `report.py`가 쓰는 WeasyPrint(Pango/Cairo 같은 OS
라이브러리 필요)를 못 다뤄서, Dockerfile로 apt 패키지까지 직접 설치하는
쪽으로 갔다. 저장소 루트의 `Dockerfile`/`.dockerignore`/`render.yaml`이 이
설정이다(빌드 컨텍스트가 루트인 이유: `alley_compass_etl/`이 `backend/`의
형제 디렉터리라 같이 COPY해야 함).

1. Render 대시보드 → **New +** → **Blueprint** → 이 GitHub 저장소 선택
   (`render.yaml`을 그대로 읽어 서비스를 만든다). 수동으로 **Web Service**를
   만들어도 되는데, 그때는 Runtime을 **Docker**로, Dockerfile 경로를
   `./Dockerfile`로 지정한다.
2. 생성된 서비스의 **Environment** 탭에서 값을 채운다 (`alley_compass_etl/.env`
   와 같은 값):
   - `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `ANTHROPIC_API_KEY`
   - `BACKEND_USE_SUPABASE=true` (render.yaml에 이미 있음)
   - `CORS_ORIGINS` — 실제 프론트 도메인(쉼표로 여러 개 가능). render.yaml에
     기본값이 있지만 배포 주소가 바뀌면 여기서 갱신한다.
   - (신형 Supabase 프로젝트면 필요 없음) `SUPABASE_JWT_SECRET` — 구형
     HS256 토큰을 쓰는 프로젝트만.
3. 배포 후 `https://<서비스명>.onrender.com/health`가 `{"status":"ok", ...}`를
   주는지 확인한다.
4. **프론트에도 반영**: `web/`을 배포한 Vercel 프로젝트의 Environment
   Variables에서 `VITE_API_BASE_URL`을 이 Render 주소로 바꾸고 Redeploy한다
   (Vite 환경변수는 빌드 시점에 번들에 박히므로 값만 바꾸고 재배포 안 하면
   반영되지 않는다).

**무료 요금제 주의**: Render 무료 플랜은 15분 동안 요청이 없으면 컨테이너를
재운다. 다시 요청이 오면 깨우는 데 30초~1분 정도 걸린다(콜드 스타트) —
시연·심사 직전에 한 번 `/health`를 미리 호출해 깨워 두면 좋다.

## 엔드포인트

| | | 비용 |
|---|---|---|
| `GET /health` | 상태 확인 + 현재 활성 모델 버전(`active_model_version()`) | 무료 |
| `GET /business-types` | 업종 목록 | 무료 |
| `GET /districts?business_code=` | 상권 목록 | 무료 |
| `POST /rank` | 조건 기반 전체 재랭킹 (PRD §16) | 무료 (결정론적, Claude 미사용) |
| `POST /parse-condition` | 자연어 문장 → 조건(업종·예산·연령·상권성격·우선순위) 구조화 출력 | **Claude API 과금 발생** (시간당 크레딧 한도 있음) |
| `POST /districts/{code}/agents` | 추천/반대 근거 생성 + 검증 (PRD §10) | **Claude API 과금 발생** |
| `POST /report` | Top-K 상권 + 각각의 추천/반대 근거를 PDF 한 장으로 (PRD F-15) | **Claude API 과금 발생** (상권당 최대 2회, `top_k` 1~10) |

`/rank`와 `/districts/{code}/agents`를 분리해 둔 이유: 랭킹은 서울 전체
후보(1,000개 이상)를 매번 다시 계산해야 하므로 비용이 드는 Claude 호출을
여기 넣으면 안 되고, 근거 생성은 사용자가 실제로 펼쳐본 상위 몇 곳에 대해서만
필요하다. `/report`는 그 근거 생성을 Top-K개만큼 자동으로 반복해 PDF로
묶어주는 것뿐 — 새 판정 로직은 없다(`report.py`는 HTML 렌더링 + PDF 변환만).

### 사용자별 Claude 호출 한도

`/parse-condition`·`/districts/{code}/agents`·`/report`는 로그인한 사용자면
누구든 부를 수 있어서, `require_user`만으로는 짧은 시간 반복 호출(실수든
악용이든)을 막지 못한다. `ratelimit.py`가 호출마다 대략적인 크레딧을 매겨
사용자별 1시간 합이 한도를 넘으면 `429`를 준다. 한도는 `.env`의
`PARSE_CREDIT_LIMIT_PER_HOUR`(기본 60) / `AGENT_CREDIT_LIMIT_PER_HOUR`(기본
40)로 조정한다. 메모리 기반이라 프로세스(인스턴스) 하나 안에서만 유효하다 —
여러 워커로 수평 확장하면 Redis 같은 공유 저장소로 옮겨야 한다.

### 상권 데이터 캐시 (업종별)

`/rank`·`/detail`·`/agents`·`/report`·`/districts`가 쓰는 상권 데이터는 **업종을 처음 고를 때
그 업종의 최근 분기만** Supabase에서 읽어 메모리에 둔다(`get_business_frame()`). 이후 같은
업종 요청은 DB를 부르지 않는다 — 연령·상권 성격·우선순위를 바꿔도 필요한 행은 그대로라서다.

| | 이전 | 지금 |
|---|---|---|
| 서버가 켜진 뒤 첫 `/rank` | 10개 업종 12,499행을 통째로 (약 25초) | 고른 업종만, 예: 카페 1,523행 (약 2초) |
| 같은 업종에서 조건만 바꿀 때 | 즉시 | 즉시 |
| 다른 업종을 처음 고를 때 | 즉시 | 그 업종을 처음 읽는 1~2초 |

- **왜 업종만 읽어도 결과가 같은가:** 랭킹·백분위·경쟁강도 비교 모집단은 전부 같은 업종 안에서만
  계산된다. 10개 업종 전부에서 예전 방식(전체 적재)과 프레임·순위·점수·상세·팩트시트가
  같음을 확인했다(LightGBM 켠 상태, 점수 차이 0).
- **기준 분기**는 업종별이 아니라 테이블 전체의 최근 분기다(예전과 같다).
- **같은 업종을 동시에 처음 요청**해도 DB는 한 번만 읽는다(업종별 잠금).
- **없는 업종**은 DB를 읽기 전에 404다. `GET /districts`는 업종(`business_code`)이 필수다.
- **메모리**는 10개 업종을 다 써도 최신 분기 한 개뿐이라 22MB 안팎이다. 18개 분기 전체를
  올리면 Render 무료 플랜(512MB)에서 죽는다(실측 731MB) — 상권 추이는 `/detail`이 그 상권만 따로 조회한다.

**갱신 주기:** 업종별 캐시가 `FRAME_CACHE_TTL_SECONDS`(`.env`, 기본 6시간)보다 오래되면 다음
요청에서 **그 업종만** 다시 읽는다. `alley_compass_etl.py`로 새 분기를 올려도 이 시간 안에는
화면에 안 보인다 — 바로 반영하려면 서버를 재시작한다. 갱신이 실패해도(Supabase 일시 오류 등)
있던 캐시로 계속 서비스하고, 다음 시도까지는 최소 그 시간만큼 간격을 둔다. 갱신 중인 다른
요청은 기다리지 않고 기존 캐시로 응답한다.

### `/report` 사용 예

```bash
# 로그인 필수 — TOKEN 은 웹에서 로그인한 뒤 받은 Supabase access_token
curl -X POST http://localhost:8000/report \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"business_code":"CS100010","budget":5000,"top_k":3}' \
  -o report.pdf
```

### macOS에서 LightGBM이 안 불러와질 때

`OSError: ... libomp.dylib ... (no such file)`이 나거나 `/health`의 `model_version`이
`heuristic-v0`면 OpenMP 런타임이 없는 것이다. `brew install libomp` 후 서버를 재시작한다.
모델 로드 실패는 예외로 죽지 않고 휴리스틱으로 대체되므로 서버 로그(`[경고] LightGBM 모델
로드 실패`)에서만 드러난다.

### macOS에서 PDF가 안 만들어질 때 (WeasyPrint)

WeasyPrint는 Pango/cairo/glib를 시스템 라이브러리로 불러온다. Apple
Silicon Homebrew(`/opt/homebrew`)는 기본 라이브러리 탐색 경로에 없어서
`cannot load library 'libgobject-2.0-0'` 같은 에러가 날 수 있다.

```bash
brew install pango   # cairo/glib/harfbuzz 등 의존성도 같이 설치됨
```

설치만 하면 된다 — `report.py`가 macOS에서 `DYLD_LIBRARY_PATH`를 자동으로
맞춰준다(Linux 서버 배포 시에는 이 문제 자체가 거의 없다).

### Windows에서 PDF가 안 만들어질 때 (WeasyPrint)

`pip install weasyprint`만으로는 부족하다. Pango(GTK) 라이브러리가 따로 필요하고,
없으면 `cannot load library 'libgobject-2.0-0'` 오류가 난다.

1. https://www.msys2.org 에서 MSYS2를 설치한다.
2. MSYS2 터미널에서 `pacman -S mingw-w64-x86_64-pango`
3. 백엔드를 띄우는 터미널에서 DLL 경로를 알려준다.
   ```bat
   set WEASYPRINT_DLL_DIRECTORIES=C:\msys64\mingw64\bin
   uvicorn main:app --reload --port 8000
   ```

설치하지 않아도 서버는 뜬다. WeasyPrint는 `/report`를 호출할 때만 불러오고,
불러오지 못하면 그 요청만 503과 안내 문구를 돌려준다(Claude를 부르기 전에
확인하므로 과금되지 않는다).

## 모델 버전

`scoring.py`가 `backend/models/*.joblib`(파일명 `v-YYYYMMDD-HHMM.joblib`, 문자열
정렬 = 시간 정렬이라 가장 최신 파일을 자동으로 고른다)을 찾으면 그 LightGBM
모델로 `stability_score`를 계산하고 응답에 `model_version: "lightgbm-<버전>"`을
찍는다. 파일이 없거나(로컬 개발 등) 예측이 실패하면 원본 feature로 계산한
휴리스틱 Score(`"heuristic-v0"`)로 조용히 대체한다 — 항상 실제로 쓰인 쪽이
응답에 그대로 명시되므로 화면과 검증 Tool이 서로 다른 값을 근거로 말하는 일이
없다.

모델을 새로 학습했으면(`ml/train.py`) `ml/models/`(실험용, gitignore)가 아니라
**`backend/models/`**에 같은 버전 문자열로 복사해야 "승격"되어 Docker 이미지에
실린다.

**점포수가 적은 상권 보정(베이지안 축소)**: LightGBM이든 휴리스틱 폴백이든,
점포가 1~2개뿐인 상권은 "폐업할 기회 자체가 없어 폐업률이 항상 0%"라 실제보다
안정적으로 오인되는 걸 실측으로 확인했다. `rank_districts()`가 계산 직후 한 번 더
`stability_score`를 업종 자체의 점포수 중앙값 쪽으로 끌어당긴다
(`STORE_COUNT_CONFIDENCE_K_FRAC`) — 업종마다 점포수 규모가 완전히 달라
(예: 커피-음료 중앙값 7개 vs 양식음식점 중앙값 3개) 고정 상수 하나로는
어느 한쪽이 항상 과하거나 부족했기 때문이다. 점포수가 `MIN_STORE_COUNT_ANY_TRUST`
미만이면 비례식과 무관하게 원점수를 아예 안 믿고 업종 중앙값으로 대체한다.

**`final_score` 구성**: `stability_score`(생존 안정성) + `target_fit_score`
(사용자가 고른 상권성격·연령대 기반 타겟 고객층 적합도)의 가중합이다(PRD §16).
기본 비중은 stability 0.70 : target_fit 0.30이고, `priority="survival"`이면
stability 쪽을, `priority="growth"`면 target_fit 쪽을 더 준다. 예산(Budget Fit)은
보증금/임대료 데이터가 없어 여전히 반영하지 않는다.

## 세션 기록

`/rank` 호출은 Supabase가 연결돼 있으면 `search_sessions` /
`recommendation_runs` / `recommendations`에 결과를 기록한다(PRD §22 Data
Flywheel). 기록에 실패해도 응답 자체는 막지 않는다 — 부가 기능이다.

---

### `GET /districts/{district_code}/detail?business_code=...`

상세 화면(PRD §17.4)이 쓰는 상권 진단 4영역 + 시계열. 구현은 `detail.py`.

**Claude 를 호출하지 않는다** — 전부 Pandas 집계라 과금이 없고, 그래서 상권을
열 때마다 바로 불러도 된다. 근거 문장 생성만 `/agents` 로 분리돼 있다.

```
diagnostics  잠재고객 / 경쟁강도 / 영업환경 / 비용
series       hourly(시간대별 유동인구) · sales · closure · competition
```

백분위는 `verification_tools.percentile()` 을 그대로 쓴다. 화면이 "상위 12%"
라고 말하는데 검증 Tool 이 다르게 판정하면 같은 숫자를 두고 서로 다른 말을
하게 되므로, 집계는 전부 백엔드에서 하고 프론트는 그리기만 한다.

없는 데이터는 지어내지 않는다.

| 상황 | 응답 |
|---|---|
| 분기가 1개뿐 | `series.sales.available=false` + `reason` 에 이유 |
| 시간대별 컬럼 미수집 | `series.hourly.available=false` |
| `store_count=0` 또는 배후수요 결측 | 경쟁강도 영역 `available=false`, `series.competition=null` |
| 임차료·공실률 | 비용 영역은 **항상** `available=false` (데이터셋에 없음) |

`extra_features` 가 JSONB 로 오는 Supabase 경로와 평면 컬럼으로 오는 로컬
디버그 CSV 경로를 둘 다 읽는다.
