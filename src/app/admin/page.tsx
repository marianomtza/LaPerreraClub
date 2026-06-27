import { Box, FileUp, LogOut, Package, RadioTower, Settings, Users } from "lucide-react";
import Link from "next/link";
import { getAdminUser } from "@/lib/auth";
import { getAdminCollections, getHomeSettings, getXosaSettings } from "@/lib/data";
import { hasPublicSupabaseConfig, hasServiceSupabaseConfig } from "@/lib/supabase/server";
import {
  createProductAction,
  createPublicationAction,
  createSpecialPageAction,
  loginAction,
  signOutAction,
  updateBookingStatusAction,
  updateOrderStatusAction,
  upsertSettingAction
} from "@/app/admin/actions";

export const metadata = {
  title: "Panel",
  robots: { index: false, follow: false }
};

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const message = typeof params.message === "string" ? params.message : "";
  const error = typeof params.error === "string" ? params.error : "";

  if (!hasPublicSupabaseConfig()) {
    return (
      <main className="shell flex min-h-[72vh] flex-col justify-center gap-5 py-16">
        <p className="font-mono text-xs uppercase text-[var(--accent)]">Panel</p>
        <h1 className="text-5xl font-black uppercase leading-none">Configura Supabase</h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` para activar el acceso por correo.
        </p>
      </main>
    );
  }

  const user = await getAdminUser();
  if (!user) {
    return (
      <main className="shell flex min-h-[72vh] flex-col justify-center gap-6 py-16">
        <div>
          <p className="font-mono text-xs uppercase text-[var(--accent)]">Panel</p>
          <h1 className="mt-3 text-5xl font-black uppercase leading-none">Entrar por correo</h1>
        </div>
        <form action={loginAction} className="panel grid max-w-md gap-4 p-5">
          <label className="grid gap-2 text-sm font-bold uppercase">
            Correo
            <input
              className="focus-ring min-h-11 rounded-[8px] border border-white/15 bg-black/30 px-3"
              name="email"
              required
              type="email"
            />
          </label>
          <button className="focus-ring min-h-11 rounded-[8px] bg-[var(--accent)] px-4 text-sm font-black uppercase text-[var(--ink)]">
            Enviar enlace
          </button>
          {message ? <p className="text-sm text-[var(--accent)]">{message}</p> : null}
          {error ? <p className="text-sm text-red-100">{error}</p> : null}
        </form>
      </main>
    );
  }

  const [collections, home, xosa] = await Promise.all([getAdminCollections(), getHomeSettings(), getXosaSettings()]);

  return (
    <main className="shell py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center">
        <div>
          <p className="font-mono text-xs uppercase text-[var(--accent)]">Panel</p>
          <h1 className="mt-2 text-5xl font-black uppercase leading-none">La Perrera Club</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{user.email}</p>
        </div>
        <form action={signOutAction}>
          <button className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-white/15 px-4 text-sm font-black uppercase">
            <LogOut aria-hidden="true" size={16} />
            Salir
          </button>
        </form>
      </div>

      {message ? <p className="panel mb-4 border-[var(--accent)] p-4 text-sm text-[var(--accent)]">{message}</p> : null}
      {error ? <p className="panel mb-4 border-red-200 p-4 text-sm text-red-100">{error}</p> : null}
      {!hasServiceSupabaseConfig() ? (
        <p className="panel mb-4 border-red-200 p-4 text-sm text-red-100">
          Falta `SUPABASE_SERVICE_ROLE_KEY`; las acciones de escritura quedan bloqueadas.
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="top-24 h-fit lg:sticky">
          <div className="panel grid gap-1 p-2 text-sm font-black uppercase">
            {[
              ["Inicio", "#inicio"],
              ["Publicaciones", "#publicaciones"],
              ["Páginas", "#paginas"],
              ["XOSA", "#xosa"],
              ["Tienda", "#tienda"],
              ["Booking", "#booking"],
              ["Club", "#club"],
              ["Archivos", "#archivos"]
            ].map(([label, href]) => (
              <a className="focus-ring rounded-[8px] px-3 py-2 text-white/78 hover:bg-white/8 hover:text-white" href={href} key={href}>
                {label}
              </a>
            ))}
          </div>
        </nav>

        <div className="grid gap-8">
          <AdminSection icon={<Settings size={18} />} id="inicio" title="Inicio">
            <SettingForm initialValue={home} label="JSON de Inicio" settingKey="home" />
          </AdminSection>

          <AdminSection icon={<RadioTower size={18} />} id="publicaciones" title="Publicaciones">
            <form action={createPublicationAction} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Título" name="title" required />
                <Input label="Tipo" name="type" required />
                <Input label="Portada" name="coverUrl" />
                <Input label="Video o enlace" name="videoUrl" />
                <Input label="Acción" name="actionLabel" />
                <Input label="URL de acción" name="actionUrl" />
                <Input label="Publicar" name="publishedAt" type="datetime-local" />
                <Input label="Retirar" name="expiresAt" type="datetime-local" />
              </div>
              <Textarea label="Texto breve" name="excerpt" />
              <Textarea label="Contenido" name="content" />
              <div className="flex flex-wrap gap-4 text-sm font-bold uppercase">
                <label><input className="mr-2" defaultChecked name="locations" type="checkbox" value="inicio" />Inicio</label>
                <label><input className="mr-2" name="locations" type="checkbox" value="xosa" />XOSA</label>
                <label><input className="mr-2" name="locations" type="checkbox" value="destacado" />Destacado</label>
              </div>
              <Select label="Estado" name="state" options={["borrador", "programado", "publicado", "retirado"]} />
              <Input label="Orden" name="sortOrder" type="number" />
              <label className="text-sm font-bold uppercase"><input className="mr-2" name="isFeatured" type="checkbox" />Destacada</label>
              <SubmitButton label="Crear publicación" />
            </form>
            <AdminList rows={collections.publications} titleKey="title" />
          </AdminSection>

          <AdminSection icon={<FileUp size={18} />} id="paginas" title="Páginas especiales">
            <form action={createSpecialPageAction} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Título" name="title" required />
                <Input label="Slug" name="slug" required />
                <Input label="SEO título" name="seoTitle" />
                <Input label="SEO descripción" name="seoDescription" />
                <Input label="Publicar" name="publishedAt" type="datetime-local" />
                <Input label="Retirar" name="expiresAt" type="datetime-local" />
              </div>
              <Textarea label="Descripción" name="description" />
              <Select label="Estado" name="state" options={["borrador", "programado", "publicado", "retirado"]} />
              <Textarea
                label="Bloques JSON"
                name="blocksJson"
                rows={8}
                defaultValue={'[{"type":"hero","data":{"title":"Título","copy":"Texto breve"}}]'}
              />
              <SubmitButton label="Crear página" />
            </form>
            <AdminList rows={collections.pages} titleKey="title" />
          </AdminSection>

          <AdminSection icon={<Settings size={18} />} id="xosa" title="XOSA">
            <SettingForm initialValue={xosa} label="JSON de XOSA" settingKey="xosa" />
          </AdminSection>

          <AdminSection icon={<Package size={18} />} id="tienda" title="Tienda">
            <form action={createProductAction} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Nombre" name="name" required />
                <Input label="Slug" name="slug" required />
                <Input label="Imagen" name="imageUrl" />
                <Input label="Precio MXN" name="priceMx" required type="number" />
                <Input label="SKU" name="sku" />
                <Input label="Inventario" name="stock" type="number" />
              </div>
              <Textarea label="Descripción" name="description" />
              <Select label="Estado" name="status" options={["borrador", "publicado", "agotado", "proximamente", "retirado"]} />
              <label className="text-sm font-bold uppercase"><input className="mr-2" name="isFeatured" type="checkbox" />Destacado</label>
              <SubmitButton label="Crear producto" />
            </form>
            <AdminList rows={collections.products} titleKey="name" />
          </AdminSection>

          <AdminSection icon={<Box size={18} />} id="pedidos" title="Pedidos">
            <div className="grid gap-3">
              {collections.orders.map((order) => (
                <form action={updateOrderStatusAction} className="panel grid gap-3 p-4 md:grid-cols-[1fr_auto_auto]" key={order.id}>
                  <input name="orderId" type="hidden" value={order.id} />
                  <div>
                    <p className="font-mono text-xs text-[var(--muted)]">{order.id}</p>
                    <p className="font-black">{order.customer_email}</p>
                  </div>
                  <Select compact name="status" options={["pendiente", "pagado", "en_preparacion", "enviado", "entregado", "cancelado", "reembolsado"]} />
                  <SubmitButton label="Guardar" />
                </form>
              ))}
              {collections.orders.length === 0 ? <p className="text-sm text-[var(--muted)]">Sin pedidos registrados.</p> : null}
            </div>
          </AdminSection>

          <AdminSection icon={<RadioTower size={18} />} id="booking" title="Booking">
            <div className="grid gap-3">
              {collections.bookings.map((booking) => (
                <form action={updateBookingStatusAction} className="panel grid gap-3 p-4" key={booking.id}>
                  <input name="bookingId" type="hidden" value={booking.id} />
                  <div>
                    <p className="font-black uppercase">{booking.name} / {booking.company}</p>
                    <p className="text-sm text-[var(--muted)]">{booking.city} · {booking.proposed_date}</p>
                  </div>
                  <Select name="status" options={["nueva", "revisando", "contactada", "en_negociacion", "confirmada", "rechazada", "archivada"]} />
                  <Textarea label="Nota interna" name="note" rows={3} />
                  <SubmitButton label="Actualizar" />
                </form>
              ))}
              {collections.bookings.length === 0 ? <p className="text-sm text-[var(--muted)]">Sin solicitudes de booking.</p> : null}
            </div>
          </AdminSection>

          <AdminSection icon={<Users size={18} />} id="club" title="Club">
            <Link className="focus-ring inline-flex min-h-11 w-fit items-center rounded-[8px] border border-white/15 px-4 text-sm font-black uppercase" href="/api/admin/export/club">
              Exportar CSV
            </Link>
            <AdminList rows={collections.club} titleKey="email" />
          </AdminSection>

          <AdminSection icon={<FileUp size={18} />} id="archivos" title="Archivos">
            <form action="/api/admin/media" className="grid gap-4" encType="multipart/form-data" method="post">
              <Input label="Texto alternativo" name="altText" />
              <input className="focus-ring rounded-[8px] border border-white/15 bg-black/30 p-3" name="file" required type="file" />
              <SubmitButton label="Subir archivo" />
            </form>
          </AdminSection>
        </div>
      </div>
    </main>
  );
}

function AdminSection({
  children,
  icon,
  id,
  title
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  id: string;
  title: string;
}) {
  return (
    <section className="panel scroll-mt-24 p-5" id={id}>
      <h2 className="mb-5 flex items-center gap-2 text-2xl font-black uppercase">
        {icon}
        {title}
      </h2>
      <div className="grid gap-5">{children}</div>
    </section>
  );
}

function SettingForm({ initialValue, label, settingKey }: { initialValue: unknown; label: string; settingKey: string }) {
  return (
    <form action={upsertSettingAction} className="grid gap-4">
      <input name="key" type="hidden" value={settingKey} />
      <Textarea defaultValue={JSON.stringify(initialValue || {}, null, 2)} label={label} name="value" rows={12} />
      <SubmitButton label="Guardar" />
    </form>
  );
}

function Input({
  label,
  name,
  required,
  type = "text"
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold uppercase">
      {label}
      <input
        className="focus-ring min-h-11 rounded-[8px] border border-white/15 bg-black/30 px-3"
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

function Textarea({
  defaultValue,
  label,
  name,
  rows = 5
}: {
  defaultValue?: string;
  label: string;
  name: string;
  rows?: number;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold uppercase">
      {label}
      <textarea
        className="focus-ring rounded-[8px] border border-white/15 bg-black/30 px-3 py-3 font-mono text-sm"
        defaultValue={defaultValue}
        name={name}
        rows={rows}
      />
    </label>
  );
}

function Select({
  compact,
  label,
  name,
  options
}: {
  compact?: boolean;
  label?: string;
  name: string;
  options: string[];
}) {
  const select = (
    <select
      className="focus-ring min-h-11 rounded-[8px] border border-white/15 bg-black/30 px-3 text-sm"
      name={name}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  if (compact) return select;

  return (
    <label className="grid gap-2 text-sm font-bold uppercase">
      {label || "Estado"}
      {select}
    </label>
  );
}

function SubmitButton({ label }: { label: string }) {
  return (
    <button className="focus-ring inline-flex min-h-11 w-fit items-center justify-center rounded-[8px] bg-[var(--accent)] px-4 text-sm font-black uppercase text-[var(--ink)]">
      {label}
    </button>
  );
}

function AdminList({ rows, titleKey }: { rows: Array<Record<string, unknown>>; titleKey: string }) {
  if (rows.length === 0) return null;

  return (
    <div className="grid gap-2">
      {rows.map((row) => (
        <div className="rounded-[8px] border border-white/10 p-3 text-sm" key={String(row.id)}>
          <p className="font-black">{String(row[titleKey] || row.id)}</p>
          <p className="font-mono text-xs text-[var(--muted)]">{String(row.state || row.status || row.order_status || "")}</p>
        </div>
      ))}
    </div>
  );
}
