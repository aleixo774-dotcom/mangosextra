import { Status, STATUS_LABEL } from "@/lib/mango-data";
import { cn } from "@/lib/utils";

const styles: Record<Status, string> = {
  recebido: "bg-muted text-muted-foreground",
  em_analise: "bg-coral/15 text-coral",
  em_simulacao: "bg-mango/20 text-[color:oklch(0.45_0.12_60)]",
  aprovado: "bg-money/20 text-[color:oklch(0.35_0.12_145)]",
  contrato: "bg-forest/15 text-forest",
  pago: "bg-money text-money-foreground",
};

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        styles[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
