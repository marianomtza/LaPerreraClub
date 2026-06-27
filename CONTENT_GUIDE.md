# Guía de contenido

## Hero

En `/admin`, sección Inicio, edita el JSON `home`.

Ejemplo:

```json
{
  "hero": {
    "title": "LA PERRERA CLUB",
    "eyebrow": "XOSA / CLUB / TIENDA",
    "primaryLabel": "Entrar al club",
    "primaryHref": "/#club",
    "secondaryLabel": "Explorar",
    "secondaryHref": "/#contenido",
    "statusItems": ["AHORA: LA PERRERA VOL. I"]
  }
}
```

Coloca `VISUALSHOW1.mp4` en `public/` y, si existe, `VISUALSHOW1-poster.webp`.

## Publicaciones

Usa `/admin#publicaciones`.

Estados:

- `borrador`
- `programado`
- `publicado`
- `retirado`

La visibilidad pública respeta `published_at` y `expires_at`.

## Páginas especiales

Usa `/admin#paginas`. El slug no puede ser `xosa`, `tienda`, `booking`, `checkout`, `admin`, `api`, `contacto`, `privacidad` ni `terminos`.

Bloques disponibles:

- `hero`
- `text`
- `image`
- `gallery`
- `video`
- `spotify`
- `apple_music`
- `streaming_links`
- `buttons`
- `countdown`
- `counter`
- `product`
- `featured_products`
- `bandsintown`
- `club_form`
- `booking_cta`
- `separator`

## Productos

Usa `/admin#tienda`.

Cada producto crea una variante inicial `Única`. Para vender:

- Estado `publicado`.
- Precio en MXN.
- Inventario mayor a cero si se rastrea inventario.
- Al menos una tarifa activa en `shipping_rules`, salvo recolección habilitada.

## Enlaces musicales y métricas

Edita el JSON `xosa` en `/admin#xosa`.

Las métricas deben incluir:

- `label`
- `value`
- `source`
- `updatedAt`
- `kind`

No se muestran métricas sin fuente o fecha.

## Archivos profesionales

Sube imágenes desde `/admin#archivos`. Press kit y rider pueden guardarse en Supabase Storage y enlazarse en los JSON de `xosa` o `booking`.

## Booking

Las solicitudes llegan a `/admin#booking`. Cambia estado y agrega notas internas sin escribir al cliente automáticamente.

## Club

Los registros llegan a `/admin#club`. Usa Exportar CSV para descargar contactos.

## Pedidos

Los pedidos aparecen en `/admin#pedidos`. El pago se confirma únicamente por webhook de Mercado Pago.
