# WhatsApp English Simulator

Simulador de conversas em inglês no estilo WhatsApp. Uma IA interpreta um personagem; você pratica respondendo; ao final, uma segunda IA avalia seu inglês com feedback detalhado.

Focado em preparação para entrevistas de emprego na área de tecnologia (nível B1/B2).

---

## Funcionalidades

- 10 cenários prontos (trabalho, viagem, dia-a-dia, social)
- Persona realista com personalidade e contexto definidos
- Sistema de engajamento — a conversa responde ao seu desempenho
- Botão de ajuda — digita em português, recebe 3 opções em inglês
- Avaliação completa com notas, correções e conversa ideal
- Histórico de sessões com gráfico de evolução
- Auth por email+senha (Supabase)

---

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Estilização | Tailwind CSS + shadcn/ui |
| Estado | Zustand |
| Backend | Next.js API Routes (serverless) |
| IA (chat/ajuda) | OpenAI `gpt-4o-mini` |
| IA (avaliação) | OpenAI `gpt-4o` |
| Auth + banco | Supabase (email+senha + tabela `sessions`) |
| Deploy | Vercel |

---

## Pré-requisitos

- Node.js 18+
- Conta OpenAI com API key
- Projeto no Supabase

---

## Setup local

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd EnglishApp
npm install
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Preencha o `.env`:

```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Banco de dados (Supabase SQL Editor)

```sql
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  scenario_code TEXT NOT NULL,
  transcript JSONB NOT NULL DEFAULT '[]',
  evaluation JSONB,
  engagement_log JSONB DEFAULT '[]',
  help_count INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own sessions"
  ON sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own sessions"
  ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4. Criar usuário

No painel do Supabase: **Authentication → Users → Add user** — informe email e senha.

### 5. Rodar

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## Deploy (Vercel)

O projeto está configurado para Vercel com Next.js. O deploy é feito via painel ou CLI.

### Via painel (recomendado)

1. Acesse [vercel.com](https://vercel.com) → seu projeto
2. Vá em **Settings → Environment Variables**
3. Adicione as 4 variáveis abaixo para o ambiente **Production**:
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Vá em **Deployments → três pontos no último deploy → Redeploy**

### Via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Após o deploy

No Supabase → **Authentication → URL Configuration**, adicione a URL do Vercel como redirect URL.

---

## Estrutura do projeto

```
EnglishApp/
├── app/
│   ├── globals.css           # Estilos globais + animações
│   ├── layout.tsx            # Layout raiz (AuthProvider)
│   ├── page.tsx              # Redirect para /login ou /scenarios
│   ├── login/page.tsx        # Tela de login
│   ├── scenarios/page.tsx    # Lista de cenários
│   ├── chat/page.tsx         # Tela de chat
│   ├── evaluation/page.tsx   # Tela de avaliação
│   ├── progress/page.tsx     # Histórico e progresso
│   └── api/
│       ├── chat/route.ts     # POST /api/chat — chama OpenAI
│       ├── sessions/route.ts # GET/POST /api/sessions — histórico
│       └── config/route.ts   # GET /api/config — chaves públicas
├── components/
│   ├── chat/                 # ChatHeader, MessageBubble, HelpModal, etc.
│   ├── scenarios/            # ScenarioCard, BriefModal
│   └── ui/                   # shadcn/ui (Button, Input, etc.)
├── contexts/
│   └── auth-context.tsx      # AuthProvider + useAuth hook
├── hooks/
│   └── useChat.ts            # Zustand store — estado completo do chat
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   ├── scenarios.ts          # Array SCENARIOS com os 10 cenários
│   ├── prompts.ts            # buildPersonaPrompt, buildEvaluatorPrompt
│   ├── api.ts                # callAPI, saveSession, fetchSessions
│   ├── utils.ts              # cn, typingDelay, formatDate, etc.
│   └── supabase/
│       ├── client.ts         # Supabase client (browser)
│       └── server.ts         # Supabase server + requireAuth()
├── knowledge/                # Materiais de estudo (base para novos cenários)
├── docs/scenarios/           # Documentação de cada cenário
├── tailwind.config.ts        # Tema WhatsApp (cores wa-*)
└── components.json           # Configuração shadcn/ui
```

---

## Cenários disponíveis

| Código | Categoria | Nível | Título |
|--------|-----------|-------|--------|
| WORK_01 | Trabalho | Iniciante | Recruiter Outreach |
| WORK_02 | Trabalho | Intermediário | Culture Fit Interview |
| WORK_03 | Trabalho | Desafiador | Technical Interview Debrief |
| TRVL_01 | Viagem | Iniciante | Hotel Check-in Problem |
| TRVL_02 | Viagem | Intermediário | Airbnb Host Local Tips |
| TRVL_03 | Viagem | Desafiador | Flight Delay — Airline Support |
| DAY_01 | Dia-a-dia | Iniciante | New Coworker Introduction |
| DAY_02 | Dia-a-dia | Intermediário | Weekend Plans with a Friend |
| DAY_03 | Dia-a-dia | Desafiador | Sports Debate with a Friend |
| SOC_01 | Social | Intermediário | Catching Up with a Friend Abroad |

Para adicionar cenários: inclua um objeto no array `SCENARIOS` em [lib/scenarios.ts](lib/scenarios.ts) e salve a documentação em `docs/scenarios/<CODIGO>.md`.

---

## Arquitetura de segurança

- `OPENAI_API_KEY` e `SUPABASE_SERVICE_ROLE_KEY` ficam **apenas no servidor** — nunca no browser
- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` são prefixadas com `NEXT_PUBLIC_` (seguro — são chaves públicas por design do Supabase)
- Todo request autenticado valida o JWT via `supabase.auth.getUser(token)` usando a service role key
- RLS no Supabase garante que cada usuário acessa apenas suas próprias sessões
- Campos aceitos no POST `/api/sessions` são validados por whitelist (sem mass assignment)
- Inputs de `/api/chat` são validados: tier na allowlist, tamanho do array e comprimento do conteúdo
