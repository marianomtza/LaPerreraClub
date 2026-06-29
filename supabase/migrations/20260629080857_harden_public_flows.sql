create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 0 check (count >= 0),
  reset_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rate_limits enable row level security;

drop trigger if exists rate_limits_touch_updated_at on public.rate_limits;
create trigger rate_limits_touch_updated_at
before update on public.rate_limits
for each row execute function public.touch_updated_at();

create or replace function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_reset_at timestamptz := now() + make_interval(secs => greatest(p_window_seconds, 1));
  v_count integer;
begin
  if p_key is null or length(trim(p_key)) = 0 or p_limit < 1 then
    return false;
  end if;

  insert into public.rate_limits(key, count, reset_at)
  values (p_key, 1, v_reset_at)
  on conflict (key) do update
    set count = case
        when public.rate_limits.reset_at <= v_now then 1
        else public.rate_limits.count + 1
      end,
      reset_at = case
        when public.rate_limits.reset_at <= v_now then v_reset_at
        else public.rate_limits.reset_at
      end,
      updated_at = v_now
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on table public.rate_limits from anon, authenticated;
grant all on table public.rate_limits to service_role;
revoke execute on function public.check_rate_limit(text, integer, integer) from public;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;

alter table public.club_submissions
  alter column name drop not null,
  alter column discovery_source drop not null,
  alter column discovery_source set default '';

alter table public.booking_requests
  alter column company drop not null,
  alter column venue drop not null,
  alter column message drop not null,
  alter column company set default '',
  alter column venue set default '',
  alter column message set default '';

alter table public.special_pages drop constraint if exists special_pages_reserved_slug;
alter table public.special_pages add constraint special_pages_reserved_slug check (
  slug not in ('xosa','tienda','booking','checkout','admin','api','contacto','privacidad','terminos','envios-y-devoluciones')
);

alter table public.orders
  add column if not exists idempotency_key text,
  add column if not exists inventory_applied_at timestamptz;

create unique index if not exists orders_idempotency_key_idx
  on public.orders (idempotency_key)
  where idempotency_key is not null;

alter table public.payment_events
  add column if not exists payment_status text,
  add column if not exists amount_cents integer,
  add column if not exists currency text;

create table if not exists public.order_inventory_applications (
  order_id uuid primary key references public.orders(id) on delete cascade,
  applied_at timestamptz not null default now()
);

alter table public.order_inventory_applications enable row level security;
revoke all on table public.order_inventory_applications from anon, authenticated;
grant all on table public.order_inventory_applications to service_role;

alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check
  check (payment_status in ('pendiente','aprobado','en_proceso','rechazado','cancelado','reembolsado','contracargo'));

alter table public.orders drop constraint if exists orders_order_status_check;
alter table public.orders add constraint orders_order_status_check
  check (order_status in ('pendiente','pagado','en_preparacion','enviado','entregado','cancelado','reembolsado','en_revision'));

drop policy if exists "Authenticated admins can manage settings" on public.site_settings;
drop policy if exists "Authenticated admins can manage links" on public.external_links;
drop policy if exists "Authenticated admins can manage publications" on public.publications;
drop policy if exists "Authenticated admins can manage special pages" on public.special_pages;
drop policy if exists "Authenticated admins can manage page blocks" on public.special_page_blocks;
drop policy if exists "Authenticated admins can manage counters" on public.counters;
drop policy if exists "Authenticated admins can manage media" on public.media_assets;
drop policy if exists "Authenticated admins can manage products" on public.products;
drop policy if exists "Authenticated admins can manage variants" on public.product_variants;
drop policy if exists "Authenticated admins can manage shipping" on public.shipping_rules;
drop policy if exists "Authenticated admins can read orders" on public.orders;
drop policy if exists "Authenticated admins can read order items" on public.order_items;
drop policy if exists "Authenticated admins can read payment events" on public.payment_events;
drop policy if exists "Authenticated admins can manage booking" on public.booking_requests;
drop policy if exists "Authenticated admins can read club" on public.club_submissions;
drop policy if exists "Authenticated admins can manage notes" on public.admin_notes;

create or replace function public.apply_paid_order_inventory(p_order_id uuid)
returns void
language plpgsql
set search_path = public
as $$
begin
  insert into public.order_inventory_applications(order_id)
  values (p_order_id)
  on conflict (order_id) do nothing;

  if not found then
    return;
  end if;

  update public.product_variants pv
  set stock_quantity = greatest(pv.stock_quantity - oi.quantity, 0),
      updated_at = now()
  from public.order_items oi
  where oi.order_id = p_order_id
    and oi.variant_id = pv.id
    and pv.track_inventory = true;

  update public.orders
  set inventory_applied_at = now(),
      updated_at = now()
  where id = p_order_id;
end;
$$;

revoke execute on function public.apply_paid_order_inventory(uuid) from public;
grant execute on function public.apply_paid_order_inventory(uuid) to service_role;
