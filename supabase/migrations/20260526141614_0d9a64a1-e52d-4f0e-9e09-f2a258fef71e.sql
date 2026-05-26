
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'indicador');
CREATE TYPE public.referral_status AS ENUM (
  'recebido','em_analise','em_simulacao','aprovado','contrato','pago','nao_aprovado'
);

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  city TEXT,
  cpf TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role function (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- ============ REFERRALS ============
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  product TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status public.referral_status NOT NULL DEFAULT 'recebido',
  observation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- ============ REFERRAL EVENTS (timeline) ============
CREATE TABLE public.referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  status public.referral_status NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.referral_events TO authenticated;
GRANT ALL ON public.referral_events TO service_role;

ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============ PUSH SUBSCRIPTIONS ============
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============

-- profiles
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- user_roles: read own roles; only admins can write
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- referrals
CREATE POLICY "Indicador views own referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (auth.uid() = indicador_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Indicador inserts own referrals" ON public.referrals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = indicador_id);

CREATE POLICY "Admin updates referrals" ON public.referrals
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- referral_events
CREATE POLICY "View events of accessible referrals" ON public.referral_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.referrals r
      WHERE r.id = referral_id
        AND (r.indicador_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Admin inserts events" ON public.referral_events
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- notifications
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- push_subscriptions
CREATE POLICY "Users manage own subscriptions" ON public.push_subscriptions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============ FUNCTIONS & TRIGGERS ============

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tr_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile + role on signup; first user becomes admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
  assigned_role public.app_role;
BEGIN
  INSERT INTO public.profiles (user_id, name, email, whatsapp, city, cpf)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'whatsapp',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'cpf'
  );

  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  IF user_count = 0 THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'indicador';
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, assigned_role);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-create initial timeline event when referral is inserted
CREATE OR REPLACE FUNCTION public.handle_new_referral()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.referral_events (referral_id, status)
  VALUES (NEW.id, NEW.status);
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_referral_inserted
  AFTER INSERT ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_referral();

-- On status change: log event AND recalculate points for indicador
CREATE OR REPLACE FUNCTION public.handle_referral_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_points INTEGER;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.referral_events (referral_id, status)
    VALUES (NEW.id, NEW.status);

    -- Recalculate points: 10 per referral in aprovado/contrato/pago
    SELECT COALESCE(COUNT(*), 0) * 10 INTO new_points
    FROM public.referrals
    WHERE indicador_id = NEW.indicador_id
      AND status IN ('aprovado','contrato','pago');

    UPDATE public.profiles
    SET points = new_points
    WHERE user_id = NEW.indicador_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_referral_status_change
  AFTER UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.handle_referral_status_change();

-- Enable realtime for kanban live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.referrals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
