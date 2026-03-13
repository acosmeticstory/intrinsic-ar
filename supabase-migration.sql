-- =============================================================
-- Supabase Auth 통합을 위한 DB 마이그레이션
-- Supabase Dashboard > SQL Editor에서 실행하세요
-- =============================================================

-- 1단계: profiles 테이블 생성
-- =============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 회원가입 시 profiles 자동 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2단계: 기존 테이블에 user_id 컬럼 추가
-- =============================================================
-- snapshots 테이블에 user_id 추가 (이미 존재할 수 있으므로 IF NOT EXISTS 사용)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'snapshots' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.snapshots ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- access_log 테이블에 user_id, email 추가
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'access_log' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.access_log ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'access_log' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.access_log ADD COLUMN email TEXT;
  END IF;
END $$;


-- 3단계: RLS 정책 적용
-- =============================================================

-- profiles 테이블 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- snapshots 테이블 RLS
ALTER TABLE public.snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "snapshots_select_own" ON public.snapshots;
CREATE POLICY "snapshots_select_own" ON public.snapshots
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "snapshots_select_shared" ON public.snapshots;
CREATE POLICY "snapshots_select_shared" ON public.snapshots
  FOR SELECT USING (is_shared = true);

DROP POLICY IF EXISTS "snapshots_insert_own" ON public.snapshots;
CREATE POLICY "snapshots_insert_own" ON public.snapshots
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "snapshots_update_own" ON public.snapshots;
CREATE POLICY "snapshots_update_own" ON public.snapshots
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "snapshots_delete_own" ON public.snapshots;
CREATE POLICY "snapshots_delete_own" ON public.snapshots
  FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "snapshots_select_admin" ON public.snapshots;
CREATE POLICY "snapshots_select_admin" ON public.snapshots
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "snapshots_delete_admin" ON public.snapshots;
CREATE POLICY "snapshots_delete_admin" ON public.snapshots
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- access_log 테이블 RLS
ALTER TABLE public.access_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "access_log_insert_auth" ON public.access_log;
CREATE POLICY "access_log_insert_auth" ON public.access_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "access_log_select_admin" ON public.access_log;
CREATE POLICY "access_log_select_admin" ON public.access_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- settings 테이블 RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_select_auth" ON public.settings;
CREATE POLICY "settings_select_auth" ON public.settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "settings_all_admin" ON public.settings;
CREATE POLICY "settings_all_admin" ON public.settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- =============================================================
-- 완료 후 수동 작업:
-- =============================================================
-- 1. Supabase Dashboard > Authentication > Users > Add User로 첫 사용자 생성
-- 2. 아래 SQL로 해당 사용자를 관리자로 승격:
--    UPDATE public.profiles SET role = 'admin' WHERE email = '관리자이메일@example.com';
-- 3. Dashboard > Auth > Providers > Email 활성화
-- 4. "Enable email signup" 비활성화 (관리자만 사용자 추가)
-- 5. Site URL을 Vercel 배포 URL로 설정
