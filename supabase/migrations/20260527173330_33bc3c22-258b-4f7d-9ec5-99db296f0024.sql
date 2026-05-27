
-- 1) Lock down realtime.messages (only used for Broadcast/Presence, which this app does not use).
-- postgres_changes still works because it filters via the underlying table's RLS using the user's JWT.
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deny all to authenticated" ON realtime.messages;
CREATE POLICY "Deny all to authenticated"
ON realtime.messages
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- 2) Lock down user_roles writes — only admins may insert/update/delete.
-- (Normal user signup is handled by the SECURITY DEFINER trigger handle_new_user, which bypasses RLS.)
DROP POLICY IF EXISTS "Admins insert roles" ON public.user_roles;
CREATE POLICY "Admins insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update roles" ON public.user_roles;
CREATE POLICY "Admins update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete roles" ON public.user_roles;
CREATE POLICY "Admins delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
