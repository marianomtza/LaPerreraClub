# Vercel Setup

Esta guia no contiene secretos reales. Configura cada valor desde Vercel Project Settings o desde el panel del proveedor correspondiente.

## Variables

| Variable | Entorno | Requerida | Uso | Como conseguir el valor | Si falta |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production | Si | URL publica para canonical, OG, auth, Mercado Pago y webhooks | Dominio final configurado en Vercel, con `https://` | En produccion se intenta usar `VERCEL_PROJECT_PRODUCTION_URL` o `VERCEL_URL`; si no existen, se usa un dominio invalido no local |
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | Si para datos/Auth | URL publica del proyecto Supabase | Supabase Dashboard, Project Settings, API | Lecturas publicas usan fallbacks; escrituras y panel quedan no disponibles |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Production, Preview | Si para datos/Auth | Llave publica recomendada para cliente/SSR | Supabase Dashboard, API keys | Se intenta `NEXT_PUBLIC_SUPABASE_ANON_KEY`; si no existe, Auth y datos remotos quedan apagados |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Compatibilidad | Llave anon legacy | Supabase Dashboard, API keys | No se usa si existe publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Si para escrituras | Server actions, checkout, formularios, admin, rate limit durable | Supabase Dashboard, service role key | En produccion endpoints sensibles fallan cerrados |
| `ADMIN_EMAILS` | Production, Preview | Si para panel | Lista de correos autorizados, separados por coma | Define correos del equipo operador | Nadie obtiene acceso admin |
| `NEXT_PUBLIC_BANDSINTOWN_ARTIST_NAME` | Production, Preview | Opcional | Widget publico de fechas | Bandsintown for Artists | El modulo de fechas se oculta |
| `NEXT_PUBLIC_BANDSINTOWN_APP_ID` | Production, Preview | Opcional | Widget publico de fechas | Bandsintown widget/app id | El modulo de fechas se oculta |
| `MERCADO_PAGO_ACCESS_TOKEN` | Production | Si para checkout | Crear preferencias de pago | Mercado Pago Developers | Checkout conserva carrito y muestra error controlado |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Production | Si para pagos | Validar firma de webhook | Mercado Pago Developers, webhook secret | Webhook rechaza eventos |
| `RESEND_API_KEY` | Production, Preview | Opcional | Correos transaccionales y operativos | Resend Dashboard | La operacion continua sin enviar correo y registra warning servidor |
| `EMAIL_FROM` | Production, Preview | Opcional | Remitente verificado | Resend dominio/remitente verificado | Correos no se envian |
| `BOOKING_NOTIFICATION_EMAIL` | Production | Opcional | Avisos internos de booking | Correo operativo real | No se envia aviso interno |
| `CLUB_NOTIFICATION_EMAIL` | Production | Opcional | Avisos internos de Club | Correo operativo real | No se envia aviso interno |
| `ORDERS_NOTIFICATION_EMAIL` | Production | Opcional | Avisos internos de pedidos | Correo operativo real | No se envia aviso interno |

## Pasos De Despliegue

1. Asociar dominio final en Vercel y configurar `NEXT_PUBLIC_SITE_URL` con la URL de produccion.
2. Mantener previews protegidos desde Vercel; desactivar proteccion solo en produccion publica.
3. Crear proyecto Supabase, aplicar migraciones y crear bucket publico `media`.
4. Configurar Email OTP en Supabase Auth y agregar `${NEXT_PUBLIC_SITE_URL}/auth/callback` como redirect URL.
5. Configurar `ADMIN_EMAILS` antes de probar magic link; si queda vacio, el panel falla cerrado.
6. Configurar webhook de Mercado Pago hacia `${NEXT_PUBLIC_SITE_URL}/api/payments/mercado-pago`.
7. Probar compra sandbox con producto publicado, inventario suficiente y tarifa de envio activa.
8. Probar webhook sandbox: aprobado, duplicado, monto incorrecto y firma invalida.
9. Probar formularios de Club y booking desde movil y escritorio.
10. Revisar legalmente `/privacidad`, `/terminos` y `/envios-y-devoluciones` antes de ventas publicas.

## Migraciones

Aplica todas las migraciones versionadas:

```bash
npx supabase db push
```

La migracion `20260629080857_harden_public_flows.sql` agrega rate limit durable, endurece politicas de admin via Data API, permite campos opcionales de Club/booking y vuelve idempotente la aplicacion de inventario pagado.
