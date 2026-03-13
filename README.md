# Aurora Finance

Aplicacao web financeira baseada no mockup fornecido e implementada em `Next.js + TypeScript + Tailwind CSS + daisyUI + Tremor`, com autenticacao Supabase no client, sincronizacao server-side com Supabase Postgres e deploy direto no Vercel.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Variaveis de ambiente

Copie `.env.example` para `.env.local`:

```bash
DATABASE_URL=
DIRECT_URL=
AURORA_WORKSPACE_KEY=default
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Para a integracao atual, o que precisa estar preenchido e:

- `DATABASE_URL`: runtime no app/Vercel, usando o pooler na porta `6543`
- `DIRECT_URL`: migracao/check, usando a conexao direta na porta `5432`
- `AURORA_WORKSPACE_KEY`: prefixo logico do snapshot salvo no banco
- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase usada no browser
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: chave publica atual do Supabase para login do usuario
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: alias legado aceito pelo projeto

Sem `NEXT_PUBLIC_SUPABASE_URL` e uma chave publica do Supabase, o app nao consegue autenticar o usuario.

## Supabase

1. Crie um projeto no Supabase.
2. Preencha `.env.local` com `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL` e a chave publica do Supabase.
3. Rode a migracao:

```bash
npm run db:migrate
```

4. Valide a conexao:

```bash
npm run db:check
```

5. Suba o projeto no Vercel com as mesmas variaveis.

Hoje o app salva um snapshot JSON em `public.finance_state`, separado por usuario autenticado, para sincronizar toda a UI atual sem reescrever o frontend. As tabelas normalizadas continuam no schema para uma evolucao posterior com persistencia relacional.

## Deploy no Vercel

1. Importe o projeto no Vercel.
2. Configure as mesmas variaveis de ambiente do `.env.local`.
3. Use os comandos padrao do Next.js:

```txt
Install Command: npm install
Build Command: npm run build
Output Directory: .next
```

## O que ja esta funcional

- Dashboard com KPIs, charts Tremor e alertas.
- Controle mensal com receitas, despesas, orcamento e metas.
- Gestao de cartoes, parcelamentos e faturas.
- Exportacao para Excel e PDF.
- API `GET/PUT /api/finance` autenticada para carga e sincronizacao com banco.
- Healthcheck em `GET /api/finance/health`.
- Configuracao de email pronta para fluxo posterior com Edge Functions ou cron.
