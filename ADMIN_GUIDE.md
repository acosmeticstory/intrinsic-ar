# INTRINSIC LINE 대시보드 — 관리자 가이드

## 개요

대시보드에는 **일반 사용자**와 **관리자** 두 가지 접속 권한이 있습니다.
비밀번호는 Supabase DB의 `settings` 테이블에서 관리되며, 관리자가 웹에서 직접 변경할 수 있습니다.

---

## 초기 설정

### 1. Supabase 프로젝트

- 프로젝트: `core-moq-dashboard`
- URL: `https://xfckwjilimedkupvxxcq.supabase.co`
- 대시보드: [Supabase Dashboard](https://supabase.com/dashboard)

### 2. 환경변수 (.env)

```
VITE_SUPABASE_URL=https://xfckwjilimedkupvxxcq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...(anon public key)
```

> `.env` 수정 후 반드시 dev 서버 재시작 필요 (`Ctrl+C` → `npm run dev`)

### 3. Supabase 테이블 구조

| 테이블 | 용도 |
|--------|------|
| `settings` | 비밀번호 등 key-value 설정 저장 |
| `access_log` | 접속 기록 (닉네임, 시각) |
| `snapshots` | 사용자 스냅샷 저장/공유 |

---

## 기본 비밀번호

| 구분 | 기본값 | 변경 가능 |
|------|--------|-----------|
| 접속 비밀번호 | `yonhee` | 관리자 패널에서 변경 |
| 관리자 비밀번호 | `admin1234` | 관리자 패널에서 변경 |

> Supabase 미연결 시 하드코딩된 `yonhee`로만 접속 가능 (관리자 기능 비활성)

---

## 사용 방법

### 일반 사용자 로그인

1. 대시보드 접속 (`http://localhost:5173` 또는 배포 URL)
2. 접속 비밀번호 입력 (기본: `yonhee`)
3. 닉네임 입력 (2~10자)
4. 대시보드 사용

### 관리자 로그인

1. 비밀번호 입력란에 **관리자 비밀번호** 입력 (기본: `admin1234`)
2. 닉네임 입력
3. 로그인 후 확인:
   - 닉네임 옆에 빨간색 **[관리자]** 배지 표시
   - 탭 바 맨 끝에 **🔒 관리자** 탭 표시

---

## 관리자 패널 기능

### 접속 비밀번호 변경
- 새 비밀번호 입력 → **변경** 클릭
- 변경 즉시 적용 (다음 로그인부터 새 비밀번호 필요)
- 현재 접속 중인 사용자에게는 영향 없음

### 관리자 비밀번호 변경
- 새 관리자 비밀번호 입력 → **변경** 클릭
- 변경 즉시 적용
- **주의: 비밀번호를 잊으면 Supabase DB에서 직접 수정해야 함**

### 최근 접속 기록
- **데이터 새로고침** 클릭 → 최근 100건의 접속 기록 표시
- 닉네임, 접속 시각 확인 가능

### 전체 스냅샷 관리
- **데이터 새로고침** 클릭 → 모든 사용자의 스냅샷 조회
- 닉네임, 라벨, 생성 시각, 공유 여부 확인
- 어떤 사용자의 스냅샷이든 **삭제** 가능

---

## 비밀번호 분실 시 복구

Supabase SQL Editor에서 직접 변경:

```sql
-- 접속 비밀번호 초기화
UPDATE settings SET value = 'yonhee', updated_at = now() WHERE key = 'access_password';

-- 관리자 비밀번호 초기화
UPDATE settings SET value = 'admin1234', updated_at = now() WHERE key = 'admin_password';
```

---

## 서버 실행

```bash
# 개발 서버 시작
npm run dev

# 빌드
npm run build
```

- 개발 서버: `http://localhost:5173` (같은 네트워크에서 `http://IP주소:5173`으로 접속 가능)
- 10분 미활동 시 자동 로그아웃

---

## Supabase 주의사항

- **무료 플랜**: 일정 기간 미사용 시 프로젝트가 자동 일시정지됨
- 일시정지 시: Supabase 대시보드 → 프로젝트 → **Resume project** 클릭으로 복원
- 복원 후 데이터는 그대로 유지됨
- 일시정지 상태에서는 하드코딩 폴백(`yonhee`)으로 접속 가능 (관리자 기능 비활성)
