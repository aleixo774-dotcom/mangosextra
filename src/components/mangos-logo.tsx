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
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="font-display text-2xl font-black tracking-tight text-[#CDFF00]">
        mangos
      </span>
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
