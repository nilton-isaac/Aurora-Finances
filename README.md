# Aurora Finance

Aplicação web financeira baseada no mockup fornecido e implementada em `Next.js + TypeScript + Tailwind CSS + daisyUI + Tremor`, com persistência local imediata, sincronização server-side com Supabase Postgres e deploy direto no Vercel.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Variáveis de ambiente

Copie `.env.example` para `.env.local`:

```bash
DATABASE_URL=
DIRECT_URL=
AURORA_WORKSPACE_KEY=default
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Para a integração atual com banco, o que realmente precisa estar preenchido é:

- `DATABASE_URL`: runtime no app/Vercel, usando o pooler na porta `6543`
- `DIRECT_URL`: migração/check, usando a conexão direta na porta `5432`
- `AURORA_WORKSPACE_KEY`: chave lógica do snapshot salvo no banco

Sem `DATABASE_URL` e `DIRECT_URL`, a aplicação continua funcional em modo local.

## Supabase

1. Crie um projeto no Supabase.
2. Preencha `.env.local` com `DATABASE_URL` e `DIRECT_URL`.
3. Rode a migração:

```bash
npm run db:migrate
```

4. Valide a conexão:

```bash
npm run db:check
```

5. Suba o projeto no Vercel com as mesmas variáveis.

Hoje o app salva um snapshot JSON em `public.finance_state` para sincronizar toda a UI atual sem reescrever o frontend. As tabelas normalizadas continuam no schema para uma evolução posterior com autenticação e persistência relacional.

## Deploy no Vercel

1. Importe o projeto no Vercel.
2. Configure as mesmas variáveis de ambiente do `.env.local`.
3. Use os comandos padrão do Next.js:

```txt
Install Command: npm install
Build Command: npm run build
Output Directory: .next
```

## O que já está funcional

- Dashboard com KPIs, charts Tremor e alertas.
- Controle mensal com receitas, despesas, orçamento e metas.
- Gestão de cartões, parcelamentos e faturas.
- Exportação para Excel e PDF.
- API `GET/PUT /api/finance` para carga e sincronização com banco.
- Healthcheck em `GET /api/finance/health`.
- Configuração de email pronta para fluxo posterior com Edge Functions ou cron.
