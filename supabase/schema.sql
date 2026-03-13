create extension if not exists pgcrypto;

create table if not exists public.finance_state (
  workspace_key text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  limit_amount numeric(12, 2) not null check (limit_amount > 0),
  due_day integer not null default 10 check (due_day between 1 and 28),
  closing_day integer not null default 5 check (closing_day between 1 and 28),
  last_digits text not null default '0000',
  gradient text not null default 'from-violet-600 via-fuchsia-600 to-slate-900',
  created_at timestamptz not null default now()
);

create table if not exists public.installments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  card_id uuid not null references public.cards (id) on delete cascade,
  description text not null,
  total_value numeric(12, 2) not null check (total_value > 0),
  installments integer not null check (installments >= 1),
  purchase_month_key text not null check (purchase_month_key ~ '^\d{4}-\d{2}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  description text not null,
  value numeric(12, 2) not null check (value > 0),
  category text not null default 'Geral',
  type text not null check (type in ('income', 'expense')),
  month_key text not null check (month_key ~ '^\d{4}-\d{2}$'),
  source text not null default 'manual' check (source in ('manual', 'installment')),
  card_id uuid references public.cards (id) on delete set null,
  installment_id uuid references public.installments (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target numeric(12, 2) not null check (target > 0),
  current numeric(12, 2) not null default 0 check (current >= 0),
  icon text not null default 'piggy-bank',
  accent text not null default 'emerald',
  created_at timestamptz not null default now()
);

create table if not exists public.report_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  enabled boolean not null default false,
  frequency text not null default 'monthly' check (frequency in ('monthly', 'weekly')),
  updated_at timestamptz not null default now()
);

alter table public.cards enable row level security;
alter table public.installments enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.report_preferences enable row level security;

drop policy if exists "Users manage own cards" on public.cards;
create policy "Users manage own cards"
on public.cards
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own installments" on public.installments;
create policy "Users manage own installments"
on public.installments
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own transactions" on public.transactions;
create policy "Users manage own transactions"
on public.transactions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own goals" on public.goals;
create policy "Users manage own goals"
on public.goals
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own report preferences" on public.report_preferences;
create policy "Users manage own report preferences"
on public.report_preferences
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
