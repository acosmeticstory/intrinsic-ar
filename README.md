# INTRINSIC LINE 원가 대시보드

CORE 화장품 MOQ / 제품 / 용량 수량 산출 대시보드

---

## 프로젝트 구조

```
intrinsic price dashboard/
├── .env                    # Supabase 환경변수 (URL, API Key)
├── index.html              # HTML 진입점
├── package.json            # 의존성 관리
├── vite.config.js          # Vite 설정 (서버 포트 등)
├── ADMIN_GUIDE.md          # 관리자 기능 가이드
├── README.md               # 이 파일
├── src/
│   └── main.jsx            # React 앱 마운트
├── remixed-36ccbdaa.tsx    # 메인 대시보드 컴포넌트 (전체 로직)
└── dist/                   # 빌드 결과물
```

---

## 기술 스택

- **React 19** — UI
- **Vite 7** — 빌드 도구 / 개발 서버
- **Supabase** — 클라우드 DB (비밀번호, 스냅샷, 접속기록)

---

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env` 파일에 Supabase 정보 입력:

```
VITE_SUPABASE_URL=https://xfckwjilimedkupvxxcq.supabase.co
VITE_SUPABASE_ANON_KEY=(anon public key)
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 접속:
- 본인 PC: `http://localhost:5173`
- 같은 네트워크: `http://(IP주소):5173`

### 4. 빌드 (배포용)

```bash
npm run build
```

빌드 결과는 `dist/` 폴더에 생성됩니다.

---

## 주요 기능

| 탭 | 기능 |
|----|------|
| 제품 선택 | 30종 제품 중 선택, 용량/수량 설정 |
| 부자재 설정 | 리드씰, 이차포장, 용기 등 부자재 비용 |
| 충전/포장 (견적) | 충전가공비, 수량별 단가 |
| AI 추천 계산 | 자동 수량/조합 추천 |
| 물류 흐름도 | 공급망 다이어그램, 리드타임 |
| 산출 결과 | SKU별 원가 산출표, CSV 내보내기 |
| 수익 분석 | 소비자가 설정, 마진율, 손익분기점 |
| 저장/불러오기 | 스냅샷 저장, 불러오기, 공유 |
| 관리자 | 비밀번호 변경, 접속기록, 스냅샷 관리 (관리자 전용) |

---

## 로그인

- **접속 비밀번호**: 일반 사용자용 (기본: `yonhee`)
- **관리자 비밀번호**: 관리자 권한 (기본: `admin1234`)
- 10분 미활동 시 자동 로그아웃
- 비밀번호는 관리자 패널에서 변경 가능

> 관리자 기능 상세 내용은 [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) 참고

---

## Supabase DB 테이블

| 테이블 | 용도 |
|--------|------|
| `settings` | 비밀번호 등 설정 (key-value) |
| `snapshots` | 사용자별 스냅샷 저장/공유 |
| `access_log` | 접속 기록 (닉네임, 시각) |

Supabase 미연결 시 localStorage 폴백으로 동작합니다 (관리자 기능 비활성).

---

## 참고

- Supabase 무료 플랜은 미사용 시 프로젝트가 일시정지될 수 있음 → 대시보드에서 Resume
- 외부 접속이 필요하면 Vercel/Netlify 등에 배포 필요
