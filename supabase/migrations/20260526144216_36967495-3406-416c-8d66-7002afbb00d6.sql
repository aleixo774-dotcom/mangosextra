
-- 1) Add 'consultor' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'consultor';
