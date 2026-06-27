create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.external_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  platform text not null,
  url text not null check (url ~ '^https?://'),
  location text not null default 'general',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.publications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null,
  excerpt text not null default '',
  content text not null default '',
  cover_url text,
  video_url text,
  action_label text,
  action_url text,
  locations text[] not null default array['inicio']::text[],
  state text not null default 'borrador' check (state in ('borrador', 'programado', 'publicado', 'retirado')),
  published_at timestamptz,
  expires_at timestamptz,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.special_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  state text not null default 'borrador' check (state in ('borrador', 'programado', 'publicado', 'retirado')),
  published_at timestamptz,
  expires_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint special_pages_reserved_slug check (
    slug not in ('xosa','tienda','booking','checkout','admin','api','contacto','privacidad','terminos')
  )
);

create table if not exists public.special_page_blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.special_pages(id) on delete cascade,
  type text not null check (
    type in (
      'hero','text','image','gallery','video','spotify','apple_music','streaming_links','buttons',
      'countdown','counter','product','featured_products','bandsintown','email_form','club_form',
      'booking_cta','separator'
    )
  ),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.counters (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value numeric not null check (value >= 0),
  source text not null,
  source_type text not null default 'manual' check (source_type in ('dato_real','meta','manual','sincronizado')),
  updated_for timestamptz not null default now(),
  prefix text,
  suffix text,
  compact boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'media',
  path text not null unique,
  original_filename text not null,
  alt_text text not null default '',
  mime_type text not null,
  width integer,
  height integer,
  size_bytes integer not null,
  hash text,
  public_url text not null,
  usage_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  status text not null default 'borrador' check (status in ('borrador','publicado','agotado','proximamente','retirado')),
  image_url text,
  gallery text[] not null default '{}'::text[],
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null default 'Única',
  sku text,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'MXN',
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  track_inventory boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shipping_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  zone text not null,
  price_cents integer not null check (price_cents >= 0),
  free_from_cents integer,
  pickup_enabled boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null default '{}'::jsonb,
  notes text not null default '',
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  currency text not null default 'MXN',
  order_status text not null default 'pendiente' check (order_status in ('pendiente','pagado','en_preparacion','enviado','entregado','cancelado','reembolsado')),
  payment_status text not null default 'pendiente' check (payment_status in ('pendiente','aprobado','rechazado','cancelado','reembolsado')),
  payment_provider text not null default 'mercado_pago',
  payment_provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid not null references public.product_variants(id),
  name text not null,
  variant_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'mercado_pago',
  provider_event_id text not null,
  order_id uuid references public.orders(id),
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create table if not exists public.club_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  city text not null,
  social_handle text,
  discovery_source text not null,
  consent boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null,
  email text not null,
  phone text not null,
  city text not null,
  venue text not null,
  proposed_date text not null,
  event_type text not null,
  capacity text not null,
  budget text not null,
  message text not null,
  consent boolean not null default true,
  status text not null default 'nueva' check (status in ('nueva','revisando','contactada','en_negociacion','confirmada','rechazada','archivada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null,
  subject_id uuid not null,
  body text not null,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists publications_public_idx on public.publications (state, published_at, expires_at, sort_order);
create index if not exists publications_locations_idx on public.publications using gin (locations);
create index if not exists products_status_idx on public.products (status, is_featured);
create index if not exists product_variants_product_idx on public.product_variants (product_id);
create index if not exists orders_email_idx on public.orders (customer_email);
create index if not exists booking_status_idx on public.booking_requests (status, created_at);
create index if not exists club_email_idx on public.club_submissions (email);
create index if not exists special_pages_public_idx on public.special_pages (slug, state, published_at, expires_at);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'site_settings','external_links','publications','special_pages','special_page_blocks','counters',
    'media_assets','products','product_variants','shipping_rules','orders','booking_requests'
  ]
  loop
    execute format('drop trigger if exists %I_touch_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger %I_touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

alter table public.site_settings enable row level security;
alter table public.external_links enable row level security;
alter table public.publications enable row level security;
alter table public.special_pages enable row level security;
alter table public.special_page_blocks enable row level security;
alter table public.counters enable row level security;
alter table public.media_assets enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.shipping_rules enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_events enable row level security;
alter table public.club_submissions enable row level security;
alter table public.booking_requests enable row level security;
alter table public.admin_notes enable row level security;

create policy "Public can read site settings" on public.site_settings for select using (true);
create policy "Public can read active external links" on public.external_links for select using (is_active);
create policy "Public can read active counters" on public.counters for select using (is_active);
create policy "Public can read media metadata" on public.media_assets for select using (true);

create policy "Public can read published publications" on public.publications for select using (
  state = 'publicado'
  and (published_at is null or published_at <= now())
  and (expires_at is null or expires_at > now())
);

create policy "Public can read published special pages" on public.special_pages for select using (
  state = 'publicado'
  and (published_at is null or published_at <= now())
  and (expires_at is null or expires_at > now())
);

create policy "Public can read active special page blocks" on public.special_page_blocks for select using (
  is_active and exists (
    select 1 from public.special_pages p
    where p.id = special_page_blocks.page_id
      and p.state = 'publicado'
      and (p.published_at is null or p.published_at <= now())
      and (p.expires_at is null or p.expires_at > now())
  )
);

create policy "Public can read visible products" on public.products for select using (
  status in ('publicado','agotado','proximamente')
);

create policy "Public can read visible variants" on public.product_variants for select using (
  is_active and exists (
    select 1 from public.products p
    where p.id = product_variants.product_id
      and p.status in ('publicado','agotado','proximamente')
  )
);

create policy "Authenticated admins can manage settings" on public.site_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can manage links" on public.external_links for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can manage publications" on public.publications for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can manage special pages" on public.special_pages for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can manage page blocks" on public.special_page_blocks for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can manage counters" on public.counters for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can manage media" on public.media_assets for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can manage products" on public.products for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can manage variants" on public.product_variants for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can manage shipping" on public.shipping_rules for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can read orders" on public.orders for select using (auth.role() = 'authenticated');
create policy "Authenticated admins can read order items" on public.order_items for select using (auth.role() = 'authenticated');
create policy "Authenticated admins can read payment events" on public.payment_events for select using (auth.role() = 'authenticated');
create policy "Authenticated admins can manage booking" on public.booking_requests for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated admins can read club" on public.club_submissions for select using (auth.role() = 'authenticated');
create policy "Authenticated admins can manage notes" on public.admin_notes for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create or replace function public.apply_paid_order_inventory(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.product_variants pv
  set stock_quantity = greatest(pv.stock_quantity - oi.quantity, 0),
      updated_at = now()
  from public.order_items oi
  where oi.order_id = p_order_id
    and oi.variant_id = pv.id
    and pv.track_inventory = true;
end;
$$;
