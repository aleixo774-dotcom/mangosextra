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
      <svg
        viewBox="0 0 400 120"
        className="h-8 w-auto select-none"
        aria-label="Mangos"
        xmlns="http://www.w3.org/2000/svg"
        draggable={false}
      >
        <text
          x="0"
          y="80"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="96"
          fontWeight="900"
          fill="#CDFF00"
          letterSpacing="-4"
        >
          mangos
        </text>
        <circle cx="390" cy="40" r="15" fill="#CDFF00" />
      </svg>
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
