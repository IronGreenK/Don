-- Guardado completo del cliente (MVP offline-first) + una fila por generación.
alter table public.runs add column estado jsonb;
create unique index runs_user_gen_key on public.runs (user_id, generacion);
