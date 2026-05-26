
-- 1) referral_notes (chat de observações na indicação)
CREATE TABLE public.referral_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_role public.app_role NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_referral_notes_referral_id ON public.referral_notes(referral_id, created_at);

GRANT SELECT, INSERT ON public.referral_notes TO authenticated;
GRANT ALL ON public.referral_notes TO service_role;

ALTER TABLE public.referral_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View notes (owner or staff)" ON public.referral_notes
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.referrals r
    WHERE r.id = referral_notes.referral_id
      AND (r.indicador_id = auth.uid()
           OR public.has_role(auth.uid(), 'admin')
           OR public.has_role(auth.uid(), 'consultor'))
  )
);

CREATE POLICY "Staff inserts notes" ON public.referral_notes
FOR INSERT TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'consultor'))
);

-- 2) Notifications: permitir admin/consultor inserir notificações (para qualquer usuário)
CREATE POLICY "Staff insert notifications" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'consultor')
);
