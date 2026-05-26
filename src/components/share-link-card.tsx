import { Copy, Share2, Link2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ShareLinkCard({ userId, firstName }: { userId: string; firstName: string }) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/r/${userId}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  }

  function shareWhats() {
    const text = `Oi! Sou ${firstName}, indico a Mangos pra você 🥭\n\nDeixe seu contato aqui e o time fala com você:\n${link}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mangos — Renda extra",
          text: `${firstName} indicou você pra Mangos 🥭`,
          url: link,
        });
      } catch {
        // user cancelled
      }
    } else {
      copy();
    }
  }

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-mango/30 bg-gradient-to-br from-mango/15 to-coral/10 p-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-forest/80">
        <Link2 className="h-3.5 w-3.5" /> Seu link de indicação
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Compartilhe — quem se cadastrar por aqui já cai como sua indicação.
      </p>

      <button
        type="button"
        onClick={copy}
        className="mt-3 flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-card/80 px-3 py-2.5 text-left"
      >
        <span className="truncate text-xs font-medium text-forest">{link}</span>
        <Copy className={`h-4 w-4 shrink-0 ${copied ? "text-money" : "text-muted-foreground"}`} />
      </button>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={shareWhats}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-forest py-2.5 text-xs font-semibold text-forest-foreground"
        >
          <Share2 className="h-3.5 w-3.5" /> WhatsApp
        </button>
        <button
          type="button"
          onClick={nativeShare}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-mango py-2.5 text-xs font-semibold text-mango-foreground"
        >
          <Share2 className="h-3.5 w-3.5" /> Compartilhar
        </button>
      </div>
    </div>
  );
}
