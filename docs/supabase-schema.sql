-- ============================================================================
-- AllBee Invitations — Supabase (Postgres) schema
-- Mirrors the current Google Sheets columns so the data layer can be swapped
-- with NO change to the front-end (only the API functions change).
-- Run in Supabase → SQL Editor. Safe to re-run (IF NOT EXISTS / OR REPLACE).
-- ============================================================================

-- ---------- LEADS ----------
create table if not exists public.leads (
  id              text primary key,                 -- AB-0001
  created_at      timestamptz not null default now(),
  name            text not null,
  mobile          text not null,
  email           text,
  event_type      text,
  event_date      date,
  interested_in   text,                             -- comma-joined, as today
  notes           text,
  source          text,
  ip              text,
  status          text not null default 'New Lead', -- New Lead→Contacted→Quotation Sent→Negotiation→Won/Lost
  value           numeric default 0,
  crm_notes       text,
  updated_at      timestamptz default now(),
  template_id     text,
  template_name   text,
  demo            text
);
create index if not exists leads_created_idx  on public.leads (created_at desc);
create index if not exists leads_status_idx   on public.leads (status);
create index if not exists leads_template_idx on public.leads (template_id);
create index if not exists leads_mobile_idx   on public.leads (right(regexp_replace(mobile,'\D','','g'),10));

-- ---------- ORDERS ----------
create table if not exists public.orders (
  id              text primary key,                 -- ORD-1001
  created_at      timestamptz not null default now(),
  order_date      date default current_date,
  name            text,
  mobile          text,
  email           text,
  event_type      text,
  invitation_type text,
  package         text,
  amount          numeric default 0,
  payment_id      text,
  status          text not null default 'New',      -- New→Designing→Review→Delivered→Completed (+ Payment Failed / Refunded)
  source          text,
  lead_id         text,
  template_id     text,
  template_name   text,
  demo            text,
  notes           text,
  updated_at      timestamptz default now(),
  assignee        text,
  delivery        text                              -- space/comma-separated delivery URLs
);
-- Idempotency: one row per captured payment (lets webhooks retry safely).
create unique index if not exists orders_payment_uidx on public.orders (payment_id) where payment_id is not null and payment_id <> '';
create index if not exists orders_created_idx  on public.orders (created_at desc);
create index if not exists orders_status_idx   on public.orders (status);
create index if not exists orders_template_idx on public.orders (template_id);
create index if not exists orders_mobile_idx   on public.orders (right(regexp_replace(mobile,'\D','','g'),10));

-- ---------- REVIEWS (future Phase 2) ----------
create table if not exists public.reviews (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  order_id    text references public.orders(id),
  name        text,
  city        text,
  event_type  text,
  rating      int check (rating between 1 and 5),
  review      text,
  template_id text,
  moderated   boolean not null default false        -- only show moderated=true publicly
);
create index if not exists reviews_moderated_idx on public.reviews (moderated, created_at desc);

-- ---------- KPI VIEW (CEO dashboard) ----------
create or replace view public.kpi_today as
select
  (select coalesce(sum(amount),0) from public.orders where order_date = current_date)            as revenue_today,
  (select coalesce(sum(amount),0) from public.orders where date_trunc('month',created_at)=date_trunc('month',now())) as revenue_month,
  (select count(*) from public.leads  where created_at::date = current_date)                     as leads_today,
  (select count(*) from public.orders where order_date = current_date)                           as orders_today,
  (select count(*) from public.orders where status in ('New','Designing','Review'))              as pending_deliveries;

-- ---------- Row Level Security ----------
-- Public reads ONLY for moderated reviews; everything else is service-role only
-- (the serverless API uses the service key). Adjust to taste.
alter table public.leads   enable row level security;
alter table public.orders  enable row level security;
alter table public.reviews enable row level security;
drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read on public.reviews for select using (moderated = true);
-- (no public policies on leads/orders → service role bypasses RLS for the API)
