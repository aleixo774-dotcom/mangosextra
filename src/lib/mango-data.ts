export type Status =
  | "recebido"
  | "em_analise"
  | "em_simulacao"
  | "aprovado"
  | "contrato"
  | "pago";

export const STATUS_LABEL: Record<Status, string> = {
  recebido: "Recebido",
  em_analise: "Em Análise",
  em_simulacao: "Em Simulação",
  aprovado: "Aprovado",
  contrato: "Contrato Emitido",
  pago: "Comissão Paga",
};

export const STATUS_ORDER: Status[] = [
  "recebido",
  "em_analise",
  "em_simulacao",
  "aprovado",
  "contrato",
  "pago",
];

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
  commission: number;
  status: Status;
  createdAt: string;
  observation?: string;
  timeline: TimelineEvent[];
};

const PRODUCTS = [
  "Consórcio Imóvel",
  "Consórcio Auto",
  "Crédito Pessoal",
  "Financiamento",
];

let _id = 1000;
const nextId = () => String(++_id);

const seed: Referral[] = [
  {
    id: nextId(),
    name: "Marina Silva",
    phone: "(11) 98765-4321",
    product: "Consórcio Imóvel",
    amount: 240000,
    commission: 1800,
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
    product: "Consórcio Auto",
    amount: 85000,
    commission: 640,
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
    product: "Crédito Pessoal",
    amount: 15000,
    commission: 220,
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
    product: "Financiamento",
    amount: 120000,
    commission: 900,
    status: "recebido",
    createdAt: "2026-05-25",
    timeline: [{ status: "recebido", date: "2026-05-25" }],
  },
  {
    id: nextId(),
    name: "Ana Beatriz",
    phone: "(41) 98123-9988",
    product: "Consórcio Imóvel",
    amount: 320000,
    commission: 2400,
    status: "contrato",
    createdAt: "2026-05-18",
    timeline: [
      { status: "recebido", date: "2026-05-18" },
      { status: "em_analise", date: "2026-05-19" },
      { status: "aprovado", date: "2026-05-21" },
      { status: "contrato", date: "2026-05-23" },
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
    const commission = Math.round(input.amount * 0.0075);
    const today = new Date().toISOString().slice(0, 10);
    const r: Referral = {
      id: nextId(),
      ...input,
      commission,
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
              : [...r.timeline, { status, date: new Date().toISOString().slice(0, 10) }],
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
