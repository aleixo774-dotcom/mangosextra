// Constantes + helpers do domínio Mangos Extra.
// Os dados ficam no Supabase — este arquivo só centraliza labels, regras de pontuação e formatação.

export type Status =
  | "recebido"
  | "em_analise"
  | "em_simulacao"
  | "aprovado"
  | "contrato"
  | "pago"
  | "nao_aprovado";

export const STATUS_LABEL: Record<Status, string> = {
  recebido: "Recebido",
  em_analise: "Em Análise",
  em_simulacao: "Em Simulação",
  aprovado: "Aprovado",
  contrato: "Contrato Emitido",
  pago: "Liberado",
  nao_aprovado: "Não aprovado agora",
};

export const STATUS_DESCRIPTION: Record<Status, string> = {
  recebido: "Indicação registrada e na fila de análise.",
  em_analise: "Nosso time está validando os dados do cliente.",
  em_simulacao: "Simulando as melhores condições para o cliente.",
  aprovado: "Crédito aprovado! Pontos contabilizados.",
  contrato: "Contrato emitido e aguardando assinatura.",
  pago: "Operação liberada e bônus disponível.",
  nao_aprovado:
    "Não foi dessa vez. Vamos guardar o contato e tentar em uma nova oportunidade.",
};

export const STATUS_ORDER: Status[] = [
  "recebido",
  "em_analise",
  "em_simulacao",
  "aprovado",
  "contrato",
  "pago",
];

export const POINT_STATUSES: Status[] = ["aprovado", "contrato", "pago"];
export const POINTS_PER_APPROVED = 10;
export const POINTS_TO_BONUS = 100;
export const BONUS_BRL = 100;

export const PRODUCTS = [
  "Antecipação do FGTS",
  "Crédito do Trabalhador (CLT)",
  "Crédito do INSS",
  "Crédito na Conta de Luz",
  "Crédito Pessoal",
  "Crédito no Cartão",
];

export const brl = (n: number) =>
  Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function bonusFromPoints(points: number): {
  earned: number;
  toNext: number;
  progress: number;
} {
  const cycles = Math.floor(points / POINTS_TO_BONUS);
  const remainder = points % POINTS_TO_BONUS;
  return {
    earned: cycles * BONUS_BRL,
    toNext: POINTS_TO_BONUS - remainder,
    progress: remainder / POINTS_TO_BONUS,
  };
}

export function pointsForStatus(status: Status): number {
  return POINT_STATUSES.includes(status) ? POINTS_PER_APPROVED : 0;
}

// Tipos compartilhados (correspondem ao schema do Supabase)
export type Referral = {
  id: string;
  indicador_id: string;
  client_name: string;
  client_phone: string;
  product: string;
  amount: number;
  status: Status;
  observation: string | null;
  created_at: string;
  updated_at: string;
};

export type TimelineEvent = {
  id: string;
  referral_id: string;
  status: Status;
  note: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  whatsapp: string | null;
  city: string | null;
  cpf: string | null;
  points: number;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};
