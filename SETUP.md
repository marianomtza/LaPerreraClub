# SETUP

## Orden recomendado

1. GitHub: repositorio y permisos del equipo.
2. Supabase: base de datos, Auth y Storage.
3. Vercel: proyecto, dominio y variables.
4. Mercado Pago Developers: Checkout Pro y webhook.
5. Resend: dominio remitente y correos.
6. Bandsintown for Artists: artista y app id.
7. Spotify, Apple Music, YouTube y redes: enlaces públicos.

## Variables

### Públicas

- `NEXT_PUBLIC_SITE_URL`: URL final del sitio.
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: llave pública anon.
- `NEXT_PUBLIC_BANDSINTOWN_ARTIST_NAME`: nombre usado por Bandsintown.
- `NEXT_PUBLIC_BANDSINTOWN_APP_ID`: app id del widget.

### Solo servidor

- `SUPABASE_SERVICE_ROLE_KEY`: escritura segura desde Server Actions y API routes.
- `ADMIN_EMAILS`: correos autorizados, separados por coma.
- `MERCADO_PAGO_ACCESS_TOKEN`: token de Checkout Pro.
- `MERCADO_PAGO_WEBHOOK_SECRET`: secreto para validar firma del webhook.
- `RESEND_API_KEY`: envío de correos.
- `EMAIL_FROM`: remitente verificado.
- `BOOKING_NOTIFICATION_EMAIL`: notificaciones de booking.
- `ORDERS_NOTIFICATION_EMAIL`: notificaciones de pedidos.
- `CLUB_NOTIFICATION_EMAIL`: notificaciones de registros del Club.

## Supabase

Aplicar:

```bash
supabase db push
```

O copiar el SQL de `supabase/migrations/202606270001_initial_schema.sql` en el editor SQL de Supabase.

Crear bucket público:

```text
media
```

Auth:

- Activar Email OTP.
- Agregar `NEXT_PUBLIC_SITE_URL/auth/callback` a Redirect URLs.
- Definir `ADMIN_EMAILS`.

## Mercado Pago

- Crear aplicación en Mercado Pago Developers.
- Guardar Access Token en `MERCADO_PAGO_ACCESS_TOKEN`.
- Configurar webhook a `/api/payments/mercado-pago`.
- Guardar el secreto de firma en `MERCADO_PAGO_WEBHOOK_SECRET`.
- Probar con pedidos de bajo monto antes de producción.

## Bandsintown

- Confirmar perfil de XOSA.
- Obtener nombre exacto del artista y app id del widget.
- Guardarlos en variables públicas.

## Resend

- Verificar dominio o remitente.
- Configurar `EMAIL_FROM`.
- Agregar correos operativos para booking, pedidos y club.

## Vercel

Revisa tambien `VERCEL_SETUP.md` para la tabla completa de variables y pruebas de produccion.

- Importar repo.
- Configurar todas las variables.
- Build command: `npm run build`.
- Install command: `npm install`.
- Agregar dominio y DNS.

## Assets incluidos

- `public/VISUALSHOW1.mp4`: hero audiovisual.
- `public/VISUALSHOW1-poster.webp`: poster optimizado del hero.
- `public/assets/booking-xosa.webp`: flyer/foto de booking.
- `public/assets/la-perrera-cover-2026.webp`: arte de La Perrera Vol. I.
- `public/assets/la-perrera-presenta.webp`: sello visual.
- `public/assets/xosa-logo-white.webp`: logo XOSA para fondos oscuros.
- `public/assets/xosa-logo-red.webp`: logo XOSA para golpes visuales.
- `public/assets/og-la-perrera.webp`: imagen social.
- `public/LAPERRERAANIM0001-0160.mp4`: animación ligera para hero.
- `public/fonts/Area-Normal-*.otf`: familia tipográfica Area.

Los PSD originales no se guardan en el repo para no inflarlo.

## Contenido pendiente

- Press kit y rider en Supabase Storage.
- Productos reales, precios e inventario.
- Tarifas de envío en `shipping_rules`.
- Links oficiales de música y redes.
