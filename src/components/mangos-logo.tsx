import logoVerde from "@/assets/mangos-logo-verde.png";
import logoRosa from "@/assets/mangos-logo-rosa.png";
import { cn } from "@/lib/utils";

export function MangosLogo({
  variant = "verde",
  badge = "EXTRA",
  className,
}: {
  variant?: "verde" | "rosa";
  badge?: string | null;
  className?: string;
}) {
  const src = variant === "rosa" ? logoRosa : logoVerde;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src={src}
        alt="Mangos"
        className="h-6 w-auto select-none"
        draggable={false}
      />
      {badge && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.2em]",
            variant === "rosa"
              ? "bg-coral text-cream"
              : "bg-mango text-mango-foreground",
          )}
        >
          {badge}
        </span>
      )}
    </div>
  );
}
