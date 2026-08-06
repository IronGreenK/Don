-- EL DON — esquema inicial (§9 del diseño: users, runs, cards, inventory)
-- Contenido (cartas, balance) en tablas → actualizable sin release.
-- Lógica sensible (gacha, economía) irá en Edge Functions en v2.

-- ---------- perfiles (1:1 con auth.users) ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  apodo text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "perfil propio: leer" on public.profiles
  for select using ((select auth.uid()) = id);
create policy "perfil propio: crear" on public.profiles
  for insert with check ((select auth.uid()) = id);
create policy "perfil propio: actualizar" on public.profiles
  for update using ((select auth.uid()) = id);

-- ---------- runs (una vida del linaje) ----------
create table public.runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  generacion int not null default 1,
  don numeric not null default 0,
  temor int not null default 0 check (temor between 0 and 100),
  alma int not null default 100 check (alma between 0 and 100),
  plata numeric not null default 10,
  edad int not null default 16,
  grado int not null default 0,
  pactos int not null default 0,
  muerto boolean not null default false,
  causa_muerte text,
  herencia numeric,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  updated_at timestamptz not null default now()
);

create index runs_user_id_idx on public.runs (user_id);

alter table public.runs enable row level security;

create policy "runs propios: leer" on public.runs
  for select using ((select auth.uid()) = user_id);
create policy "runs propios: crear" on public.runs
  for insert with check ((select auth.uid()) = user_id);
create policy "runs propios: actualizar" on public.runs
  for update using ((select auth.uid()) = user_id);
create policy "runs propios: borrar" on public.runs
  for delete using ((select auth.uid()) = user_id);

-- ---------- cards (contenido data-driven, §6) ----------
create table public.cards (
  id text primary key,
  region text not null,
  tipo text not null default 'normal' check (tipo in ('normal', 'apuesta', 'ad')),
  requisitos jsonb not null default '{}'::jsonb,
  texto text not null,
  opciones jsonb not null default '[]'::jsonb,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.cards enable row level security;

-- Lectura pública (también cuentas anónimas); escritura solo con service role.
create policy "cartas activas: lectura publica" on public.cards
  for select using (activa);

-- ---------- inventory (para la gacha de v2) ----------
create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item text not null,
  qty int not null default 1 check (qty >= 0),
  obtenido_at timestamptz not null default now()
);

create index inventory_user_id_idx on public.inventory (user_id);

alter table public.inventory enable row level security;

create policy "inventario propio: leer" on public.inventory
  for select using ((select auth.uid()) = user_id);
create policy "inventario propio: crear" on public.inventory
  for insert with check ((select auth.uid()) = user_id);
create policy "inventario propio: actualizar" on public.inventory
  for update using ((select auth.uid()) = user_id);
