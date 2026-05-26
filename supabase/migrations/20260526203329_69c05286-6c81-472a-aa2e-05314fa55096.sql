ALTER TABLE public.profiles ADD COLUMN slug TEXT;
CREATE UNIQUE INDEX profiles_slug_lower_idx ON public.profiles (LOWER(slug)) WHERE slug IS NOT NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_slug_format CHECK (slug IS NULL OR slug ~ '^[a-zA-Z0-9_-]{3,30}$');