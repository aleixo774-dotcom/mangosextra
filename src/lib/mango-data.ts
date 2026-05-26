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

// Fluxo linear principal (sem o terminal alternativo nao_aprovado)
export const STATUS_ORDER: Status[] = [
  "recebido",
  "em_analise",
  "em_simulacao",
  "aprovado",
  "contrato",
  "pago",
];

// Status que contabilizam pontos para o indicador
export const POINT_STATUSES: Status[] = ["aprovado", "contrato", "pago"];
export const POINTS_PER_APPROVED = 10;
export const POINTS_TO_BONUS = 100; // a cada 100 pts
export const BONUS_BRL = 100; // ganha R$ 100

export type TimelineEvent = {
  status: Status;
  date: string;
  note?: string;
};

export type Referral = {
  id: string;
  name: string;
  phone: string;
  product: string;
  amount: number;
  status: Status;
  createdAt: string;
  observation?: string;
  timeline: TimelineEvent[];
};

// Produtos reais da Mangos Assessoria
const PRODUCTS = [
  "Antecipação do FGTS",
  "Crédito do Trabalhador (CLT)",
  "Crédito do INSS",
  "Crédito na Conta de Luz",
  "Crédito Pessoal",
  "Crédito no Cartão",
];

let _id = 1000;
const nextId = () => String(++_id);

const seed: Referral[] = [
  {
    id: nextId(),
    name: "Marina Silva",
    phone: "(11) 98765-4321",
    product: "Antecipação do FGTS",
    amount: 4800,
    status: "aprovado",
    createdAt: "2026-05-20",
    timeline: [
      { status: "recebido", date: "2026-05-20" },
      { status: "em_analise", date: "2026-05-21" },
      { status: "em_simulacao", date: "2026-05-22" },
      { status: "aprovado", date: "2026-05-24" },
    ],
  },
  {
    id: nextId(),
    name: "Carlos Mendes",
    phone: "(21) 99123-4567",
    product: "Crédito do Trabalhador (CLT)",
    amount: 8500,
    status: "em_simulacao",
    createdAt: "2026-05-22",
    timeline: [
      { status: "recebido", date: "2026-05-22" },
      { status: "em_analise", date: "2026-05-23" },
      { status: "em_simulacao", date: "2026-05-24" },
    ],
  },
  {
    id: nextId(),
    name: "Juliana Rocha",
    phone: "(31) 98800-1122",
    product: "Crédito do INSS",
    amount: 15000,
    status: "pago",
    createdAt: "2026-05-10",
    timeline: [
      { status: "recebido", date: "2026-05-10" },
      { status: "em_analise", date: "2026-05-11" },
      { status: "aprovado", date: "2026-05-13" },
      { status: "contrato", date: "2026-05-15" },
      { status: "pago", date: "2026-05-18" },
    ],
  },
  {
    id: nextId(),
    name: "Roberto Lima",
    phone: "(85) 99777-2211",
    product: "Crédito na Conta de Luz",
    amount: 1200,
    status: "recebido",
    createdAt: "2026-05-25",
    timeline: [{ status: "recebido", date: "2026-05-25" }],
  },
  {
    id: nextId(),
    name: "Ana Beatriz",
    phone: "(41) 98123-9988",
    product: "Crédito Pessoal",
    amount: 12000,
    status: "contrato",
    createdAt: "2026-05-18",
    timeline: [
      { status: "recebido", date: "2026-05-18" },
      { status: "em_analise", date: "2026-05-19" },
      { status: "aprovado", date: "2026-05-21" },
      { status: "contrato", date: "2026-05-23" },
    ],
  },
  {
    id: nextId(),
    name: "Felipe Andrade",
    phone: "(51) 98444-3322",
    product: "Crédito no Cartão",
    amount: 3500,
    status: "nao_aprovado",
    createdAt: "2026-05-12",
    timeline: [
      { status: "recebido", date: "2026-05-12" },
      { status: "em_analise", date: "2026-05-13" },
      {
        status: "nao_aprovado",
        date: "2026-05-15",
        note: "Tentaremos em uma nova oportunidade.",
      },
    ],
  },
];

type Listener = () => void;
const listeners = new Set<Listener>();
let store: Referral[] = seed;

export const mangoStore = {
  list(): Referral[] {
    return store;
  },
  get(id: string) {
    return store.find((r) => r.id === id);
  },
  add(input: {
    name: string;
    phone: string;
    product: string;
    amount: number;
    observation?: string;
  }) {
    const today = new Date().toISOString().slice(0, 10);
    const r: Referral = {
      id: nextId(),
      ...input,
      status: "recebido",
      createdAt: today,
      timeline: [{ status: "recebido", date: today }],
    };
    store = [r, ...store];
    emit();
    return r;
  },
  setStatus(id: string, status: Status) {
    store = store.map((r) =>
      r.id === id
        ? {
            ...r,
            status,
            timeline: r.timeline.some((t) => t.status === status)
              ? r.timeline
              : [
                  ...r.timeline,
                  { status, date: new Date().toISOString().slice(0, 10) },
                ],
          }
        : r,
    );
    emit();
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  products() {
    return PRODUCTS;
  },
};

function emit() {
  listeners.forEach((l) => l());
}

import { useSyncExternalStore } from "react";
export function useMangoStore() {
  return useSyncExternalStore(
    (cb) => mangoStore.subscribe(cb),
    () => mangoStore.list(),
    () => mangoStore.list(),
  );
}

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ===== Pontuação =====
export function pointsFor(r: Referral): number {
  return POINT_STATUSES.includes(r.status) ? POINTS_PER_APPROVED : 0;
}

export function totalPoints(list: Referral[]): number {
  return list.reduce((s, r) => s + pointsFor(r), 0);
}

export function bonusFromPoints(points: number): {
  earned: number; // BRL já conquistado
  toNext: number; // pontos até o próximo bônus
  progress: number; // 0..1 dentro do ciclo atual
} {
  const cycles = Math.floor(points / POINTS_TO_BONUS);
  const remainder = points % POINTS_TO_BONUS;
  return {
    earned: cycles * BONUS_BRL,
    toNext: POINTS_TO_BONUS - remainder,
    progress: remainder / POINTS_TO_BONUS,
  };
}
