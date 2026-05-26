
-- Drop & recreate referral policies to include consultor
DROP POLICY IF EXISTS "Admin updates referrals" ON public.referrals;
DROP POLICY IF EXISTS "Indicador views own referrals" ON public.referrals;

CREATE POLICY "Staff or owner views referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (
    auth.uid() = indicador_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'consultor')
  );

CREATE POLICY "Staff updates referrals" ON public.referrals
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'consultor')
  );

-- referral_events: consultor can also insert and view
DROP POLICY IF EXISTS "Admin inserts events" ON public.referral_events;
DROP POLICY IF EXISTS "View events of accessible referrals" ON public.referral_events;

CREATE POLICY "Staff inserts events" ON public.referral_events
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'consultor')
  );

CREATE POLICY "View events of accessible referrals" ON public.referral_events
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.referrals r
    WHERE r.id = referral_events.referral_id
      AND (
        r.indicador_id = auth.uid()
        OR public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'consultor')
      )
  ));

-- Profiles: staff can view & update
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

CREATE POLICY "View profiles (self or staff)" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'consultor')
  );

CREATE POLICY "Update profiles (self or admin)" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
  );

-- user_roles: admin can view all
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "View roles (self or admin)" ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
  );

-- Updated handle_new_user: respect role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_count INTEGER;
  assigned_role public.app_role;
  meta_role TEXT;
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

  meta_role := NEW.raw_user_meta_data->>'role';
  SELECT COUNT(*) INTO user_count FROM public.user_roles;

  IF meta_role IN ('admin','consultor','indicador') THEN
    assigned_role := meta_role::public.app_role;
  ELSIF user_count = 0 THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'indicador';
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, assigned_role);

  RETURN NEW;
END;
$function$;
