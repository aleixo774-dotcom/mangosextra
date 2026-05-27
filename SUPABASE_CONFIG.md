# Configuração do Supabase - Guia de Setup

## Erro Atual
O aplicativo não consegue conectar ao banco de dados porque as variáveis de ambiente estão incorretas ou vazias.

## Como Corrigir em 3 Passos

### 1️⃣ Obtenha as Credenciais do Supabase

1. Acesse: https://app.supabase.com
2. Faça login com sua conta
3. Selecione seu projeto
4. No menu esquerdo, clique em: **Settings > API**
5. Você verá:
   - **Project URL** ← Copie isto
   - **Project API keys > anon** ← Copie isto também
   - **Project API keys > service_role** (não use este)

### 2️⃣ Preencha o Arquivo `.env`

Abra o arquivo `.env` na raiz do projeto e preencha **EXATAMENTE** desta forma:

```env
# Copie a URL exata do Supabase (do passo anterior)
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co

# Copie a chave ANON exata do Supabase (do passo anterior)
# Começa com: eyJhbGciOi...
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...

# Repita os mesmos valores aqui (fallback)
SUPABASE_URL=https://seu-projeto-id.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...

# Extraia o ID da URL (a parte antes de .supabase.co)
# Exemplo: se URL é https://hwcvxchacxdqwftqxvks.supabase.co
# então ID é: hwcvxchacxdqwftqxvks
VITE_SUPABASE_PROJECT_ID=seu-projeto-id
```

### 3️⃣ Teste a Conexão

Após preencher o `.env`:

```bash
npm run build
```

Se não houver erros, a conexão está configurada.

## Verificação Rápida

Use este script para verificar se as variáveis estão corretas:

```bash
# Verifica se as variáveis foram carregadas
echo "VITE_SUPABASE_URL: $VITE_SUPABASE_URL"
echo "VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:0:20}..." # mostra apenas os primeiros 20 caracteres
```

## Nomes das Variáveis Exatos

| Variável | Obrigação | Formato |
|----------|-----------|---------|
| `VITE_SUPABASE_URL` | ✅ Obrigatória | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ Obrigatória | `eyJhbGciOi...` (JWT token) |
| `SUPABASE_URL` | ✅ Obrigatória | `https://xxxx.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | ✅ Obrigatória | `eyJhbGciOi...` (JWT token) |
| `VITE_SUPABASE_PROJECT_ID` | ⚠️ Recomendado | `seu-projeto-id` (extraído da URL) |

## Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se o `.env` está preenchido
- Verifique se não há espaços em branco extras
- Reinicie o servidor de desenvolvimento

### Erro: "401 Unauthorized"
- A chave ANON key está errada
- Verifique se copiou a correta (não a service_role key)

### Indicações não são salvadas
- Verifique se `VITE_SUPABASE_URL` aponta para o projeto correto
- Verifique se o banco de dados tem as tabelas criadas (migrations aplicadas)

---

**Pronto para enviar os valores do Supabase?**
