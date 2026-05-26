## Visão geral

Tudo que você pediu é viável, mas é trabalho grande. Vou dividir em **4 fases** e executar uma de cada vez, validando entre elas. Confirma o plano e eu já começo a Fase 1.

---

### 🟢 Fase 1 — Fundação Cloud (backend real)

**O que muda:** sai o "store em memória", entra banco de dados de verdade.

- Schema do banco:
  - `profiles` (indicador: nome, whatsapp, cidade, cpf, pontos, último acesso)
  - `referrals` (indicações ligadas ao indicador, status, timeline)
  - `user_roles` (admin vs indicador, com função `has_role` segura)
  - `notifications` (histórico de notificações enviadas)
  - `push_subscriptions` (tokens dos dispositivos pra push)
- RLS em todas as tabelas (indicador só vê o que é dele; admin vê tudo)
- Autenticação: email/senha + Google
- Tela `/login` + proteção de rotas (`_authenticated`)
- Refatorar `Home`, `Nova`, `Detalhe`, `Admin`, `Cadastro`, `Admin Usuários` pra ler/escrever do banco
- Cálculo de pontos virou função no banco (fonte única da verdade)

**Resultado:** app funciona de verdade, com login, dados persistentes e multi-usuário.

---

### 🟡 Fase 2 — PWA instalável

**O que muda:** "Adicionar à tela inicial" funciona no Android e iOS.

- `manifest.webmanifest` com ícones Mangos (gerar 192px + 512px)
- Meta tags pra iOS (`apple-touch-icon`, `apple-mobile-web-app-capable`)
- Banner "Instalar app" dentro do app (botão visível)
- Tela `/perfil` mostra "App instalado ✅" quando rodando em standalone
- **Sem service worker complexo** — só o necessário pra push (Fase 3)

**Resultado:** usuário abre no celular → "Adicionar à tela inicial" → vira ícone do Mangos.

---

### 🟠 Fase 3 — Push notifications (Web Push)

**O que muda:** notificação chega no celular mesmo com app fechado.

- Gerar **VAPID keys** (grátis, sem Firebase)
  - Pública vai pro frontend, privada vira secret no Cloud
- `service-worker.js` que recebe push e mostra notificação
- UI: botão "🔔 Ativar notificações" em `/perfil`
  - Pede permissão → registra subscription → salva em `push_subscriptions`
- Server functions pra disparar push:
  - `sendPushToUser(userId, title, body, url)` — usa `web-push` package
- **Triggers automáticos:**
  - ✅ Mudança de status da indicação → notifica indicador
  - 🎉 100 pts atingido → notifica indicador
- Tela admin: enviar **campanha em massa** ("Bônus em dobro fds!")
- Aviso visual pra usuário iOS: "Pra receber notificações, instale o app primeiro"

**Resultado:** Android e iOS-instalado recebem push de verdade.

---

### 🔵 Fase 4 — Cron de inatividade + polish

**O que muda:** lembretes automáticos.

- `pg_cron` roda 1x por dia
- Chama endpoint `/api/public/hooks/inactivity-reminder`
- Lógica: usuário sem indicação há 7 dias → push "Faz 7 dias sem indicar 🥭"
- Configurável pelo admin (ligar/desligar)

**Resultado:** retenção automática sem você fazer nada manualmente.

---

## Como vou executar

- Faço **uma fase de cada vez**, testando entre elas
- Depois de cada fase, te peço pra abrir no celular e validar
- Tempo estimado: cada fase = 1 a 2 mensagens minhas

## Decisões técnicas (você não precisa entender, só aprovar)

- **Auth:** Email/senha + Google (managed do Cloud, sem credencial sua)
- **Push:** Web Push padrão (VAPID) — não usa Firebase, não tem custo
- **Realtime:** quando admin mudar status no kanban, indicador vê na hora (via Supabase Realtime)
- **Roles:** Admin vs Indicador via tabela `user_roles` (seguro, sem privilege escalation)

## Pergunta antes de começar a Fase 1

Quem é o **primeiro admin**? Posso fazer de duas formas:
1. **Você me dá um email** → eu já deixo esse email com role admin no seed
2. **Primeiro usuário que se cadastrar vira admin** automaticamente (mais simples pra começar)

Aprova o plano e me responde a pergunta acima que eu começo a Fase 1 já já.
