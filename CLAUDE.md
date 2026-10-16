# WhatsApp English Simulator — Project Decisions

## What this is
A WhatsApp-style English conversation simulator. An AI plays the other person; the user replies; a second AI evaluates the English at the end.

## Tech stack
- **Front-end:** `public/index.html` — single file, pure HTML/CSS/JS, no framework, no build
- **Back-end:** Vercel serverless functions in `api/`
- **AI:** OpenAI — `gpt-4o-mini` for persona/helper, `gpt-4o` for evaluator
- **Auth + DB:** Supabase (Google OAuth + sessions table with RLS)
- **Local dev:** `node server.js` (Express, wraps the same API handlers)

## Auth
Supabase email+password (`signInWithPassword`). Sem Google OAuth. O usuário cria sua conta pelo dashboard do Supabase (Authentication → Users → Add user) e faz login com email+senha diretamente no app. JWT gerado pelo Supabase é validado em cada chamada de API via `supabase.auth.getUser(token)` usando a service_role key no servidor.

## User context
- Learning goal: job interview practice (tech/software area)
- Level: B1/B2
- Main difficulties: verb tenses, prepositions
- Feedback language: English with Portuguese explanations

## Current scenarios (10 total)
| Code | Category | Level | Title |
|------|----------|-------|-------|
| WORK_01 | work | beginner | Recruiter Outreach |
| WORK_02 | work | intermediate | Culture Fit Interview |
| WORK_03 | work | challenging | Technical Interview Debrief |
| TRVL_01 | travel | beginner | Hotel Check-in Problem |
| TRVL_02 | travel | intermediate | Airbnb Host Local Tips |
| TRVL_03 | travel | challenging | Flight Delay — Airline Support |
| DAY_01 | day | beginner | New Coworker Introduction |
| DAY_02 | day | intermediate | Weekend Plans with a Friend |
| DAY_03 | day | challenging | Sports Debate with a Friend |
| SOC_01 | social | intermediate | Catching Up with a Friend Abroad |

To add new scenarios: add an object to the `SCENARIOS` array in `public/index.html`. Also save a doc in `docs/scenarios/<CODE>.md`.

## Knowledge base
User materials go in `knowledge/`. When adding scenarios based on new material, read all files in `knowledge/` first and base vocabulary, topics, and context on that content. Do NOT change existing scenarios; add new ones.

---

## First-time setup

### 1. OpenAI API key
- Get from: https://platform.openai.com/api-keys
- Add to `.env`: `OPENAI_API_KEY=sk-...`

### 2. Supabase project
1. Use um dos seus projetos existentes em supabase.com
2. Vá em **Settings → API** → copie `URL`, `anon key` e `service_role key` → já estão no `.env`
3. Crie sua conta de usuário: **Authentication → Users → Add user** → informe seu email e senha
4. No **SQL Editor**, rode:

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

### 3. Local development
```
cp .env.example .env
# fill in the values
npm install
node server.js
# open http://localhost:3000
```
Or just double-click `start.bat`.

### 4. Deploy to Vercel
```
npm install -g vercel
vercel login
vercel
# follow prompts; set env vars in Vercel dashboard or via:
vercel env add OPENAI_API_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel --prod
```
In Supabase → Auth → URL Configuration, add your Vercel URL as a redirect URL.

---

## Architecture notes
- All env vars are server-side only (`OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). Never in the HTML.
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` are returned to the client via `/api/config` (these are safe to expose — that is their intended use).
- The client authenticates with Supabase directly (Google OAuth). Every API call sends the Supabase JWT as `Authorization: Bearer <token>`. The server validates it with `supabase.auth.getUser(token)` using the service role key.
- Sessions are saved to Supabase via the server (service role bypasses RLS). The user can only read their own sessions (RLS policy).
- Consecutive messages with the same role are merged before sending to OpenAI (API requirement).

## Build order (original spec)
- [x] (a) WhatsApp page + persona + scenarios
- [x] (b) Evaluation
- [x] (c) History/Progress
- [x] (d) Help button ("How do I say…?")
- [ ] (e) Deploy — run `vercel --prod` when ready

## Optional features (not yet built)
- Voice mode (OpenAI Realtime API via WebRTC)
- Voice messages in chat (TTS + STT)
- Scenario editor UI (create/edit without touching code)
