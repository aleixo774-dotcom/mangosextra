import { useState, useEffect } from "react";
import { Check, Loader2, Link2, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { checkSlugAvailable } from "@/lib/public-referral.functions";

const SLUG_RE = /^[a-z0-9_-]{3,30}$/;

export function SlugEditor({
  userId,
  currentSlug,
  onChange,
}: {
  userId: string;
  currentSlug: string | null;
  onChange: (newSlug: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentSlug ?? "");
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const check = useServerFn(checkSlugAvailable);

  const normalized = value.trim().toLowerCase();
  const isValidFormat = SLUG_RE.test(normalized);
  const isSame = normalized === (currentSlug ?? "");

  // Debounced availability check
  useEffect(() => {
    if (!editing || !isValidFormat || isSame) {
      setAvailable(null);
      return;
    }
    setChecking(true);
    const handle = setTimeout(async () => {
      try {
        const res = await check({ data: { slug: normalized } });
        setAvailable(res.available);
      } catch {
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [normalized, isValidFormat, isSame, editing, check]);

  async function save() {
    if (!isValidFormat || available === false || saving) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ slug: normalized })
        .eq("user_id", userId);
      if (error) throw error;
      onChange(normalized);
      toast.success("Apelido atualizado!");
      setEditing(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setValue(currentSlug ?? "");
    setAvailable(null);
    setEditing(false);
  }

  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-forest/80">
        <Link2 className="h-3.5 w-3.5" /> Apelido do seu link
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Defina um apelido fácil de lembrar pro link que você compartilha.
      </p>

      {!editing ? (
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="min-w-0 truncate rounded-xl bg-muted/40 px-3 py-2 text-xs font-medium text-forest">
            <span className="text-muted-foreground">/r/</span>
            <span>{currentSlug || "sem-apelido"}</span>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 rounded-full bg-forest px-3 py-1.5 text-[11px] font-bold text-forest-foreground"
          >
            {currentSlug ? "Trocar" : "Definir"}
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="flex items-stretch overflow-hidden rounded-xl border border-border bg-card focus-within:border-mango">
            <span className="flex items-center bg-muted/40 px-3 text-xs text-muted-foreground">
              /r/
            </span>
            <input
              autoFocus
              value={value}
              onChange={(e) =>
                setValue(e.target.value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 30))
              }
              placeholder="seunome"
              className="flex-1 bg-transparent px-2 py-2 text-sm outline-none"
              inputMode="text"
              autoCapitalize="none"
              autoComplete="off"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {!normalized && "Entre 3 e 30 letras, números, hífen ou underline."}
            {normalized && !isValidFormat && (
              <span className="text-destructive">
                Use só letras, números, hífen ou underline (3–30 caracteres).
              </span>
            )}
            {normalized && isValidFormat && isSame && "Esse já é seu apelido atual."}
            {normalized && isValidFormat && !isSame && checking && "Verificando..."}
            {normalized && isValidFormat && !isSame && !checking && available === true && (
              <span className="text-money">✓ Disponível!</span>
            )}
            {normalized && isValidFormat && !isSame && !checking && available === false && (
              <span className="text-destructive">Esse apelido já está em uso.</span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={!isValidFormat || isSame || available === false || saving || checking}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-money py-2 text-xs font-bold text-money-foreground disabled:opacity-40"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="flex items-center justify-center gap-1 rounded-xl border border-border px-4 text-xs font-semibold"
            >
              <X className="h-3.5 w-3.5" /> Cancelar
            </button>
          </div>
          {currentSlug && (
            <p className="text-[10px] text-coral">
              ⚠️ Ao trocar, o link antigo (/r/{currentSlug}) deixa de funcionar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
