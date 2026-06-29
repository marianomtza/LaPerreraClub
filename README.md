# La Perrera Club

Primera versión compacta de La Perrera Club: música, comunidad, tienda, campañas especiales y booking sin fingir contenido que todavía no existe.

## Stack

- Next.js App Router
- TypeScript estricto
- Tailwind CSS
- Supabase para datos, autenticación y storage
- Mercado Pago Checkout Pro
- Resend para correos
- Bandsintown como fuente única de presentaciones
- Vercel para despliegue

## Desarrollo local

```bash
npm install
cp .env.example .env
npm run dev
```

La app funciona con estados vacíos cuando faltan servicios externos. Las acciones que escriben datos requieren Supabase configurado.

## Comandos

```bash
npm run dev
npm run lint
npm run type-check
npm run test
npm run build
```

## Rutas

- `/`
- `/xosa`
- `/tienda`
- `/tienda/[slug]`
- `/booking`
- `/checkout`
- `/checkout/exito`
- `/checkout/pendiente`
- `/checkout/error`
- `/admin`
- `/[slug]` para páginas especiales publicadas

## Estructura

- `src/app`: rutas, API routes y panel
- `src/components`: componentes públicos, formularios, tienda y bloques
- `src/lib`: datos, Supabase, validaciones, pagos, correo y utilidades
- `public/assets`: versiones WebP de arte/flyers, sin PSD pesados
- `public/fonts`: tipografía Area usada por la interfaz
- `supabase/migrations`: SQL versionado
- `DESIGN.md`: dirección visual y reglas de marca

## Deploy

1. Crear proyecto en Supabase y aplicar migraciones.
2. Crear bucket público `media`.
3. Configurar variables en Vercel.
4. Configurar Mercado Pago, Resend y Bandsintown.
5. Revisar `VERCEL_SETUP.md` y desplegar en Vercel con `npm run build`.

No se guardan secretos en el repositorio.
