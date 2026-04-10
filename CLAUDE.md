@AGENTS.md

# DiamyVer4 — Contexto del Proyecto

## ¿Qué es esto?
Tienda online para **Diamy Laser Cut** (diamylasercut.com.mx), empresa mexicana de corte láser y grabado personalizado. Vende acrilicos, playeras estampadas, tazas, MDF, stickers, viniles, etc.

---

## Stack técnico

| Tecnología | Versión | Notas |
|---|---|---|
| Next.js | 16.2.1 | App Router, `export const dynamic = "force-dynamic"` en todas las páginas |
| React | 19.2.4 | |
| Prisma | 7.5.0 | Client generado en `src/generated/prisma` (NO en node_modules) |
| PostgreSQL | — | Schema: `diamy_v4`. Siempre usar `SET search_path` |
| Tailwind CSS | v4 | Design tokens via CSS variables |
| TypeScript | — | Tipos en `src/types/index.ts` |
| Sharp | — | Para resize de imágenes antes de subir o enviar a Claude API |
| Material Symbols | Outlined | Via Google Fonts CDN, usar `<span className="material-symbol">icon_name</span>` |

**Fuentes:** Noto Serif (`font-serif`) + Manrope (`font-sans`)

---

## Estructura del repositorio

```
DiamyVer4/
├── app/                  ← Submodule Next.js (repo: webfullstack77-max/diamy-web, rama: main)
├── publisher-bot/        ← Bot WhatsApp/FB/IG (Node.js, PM2: diamy-pub)
└── .env.production       ← Variables de entorno del VPS (DATABASE_URL, etc.)
```

El repo raíz también apunta a `webfullstack77-max/diamy-web` (rama: `master`).

---

## Base de datos — Modelos Prisma

```prisma
Category        id, slug, name, description, image, parentId (self-ref), promoMode, promoImage, promoDescription
Product         id, slug, title, description, price, originalPrice, images[], materials[], categoryId, subcategoryId,
                isActive, isFeatured, isCollection, isMassiveGallery, variablePrice
Testimonial     id, author, role, text, rating, avatar
AdminSession    id, token, expiresAt
SiteConfig      id="main", productOfMonthImage, productOfMonthText, productOfMonthLink  ← singleton
AdsQueue        id, title, imageUrl, caption, hashtags, channels, scheduleTime, status, sentAt, errorLog, fbPostId, igPostId
```

**Comandos Prisma:**
```bash
npm run db:generate          # genera cliente
npm run db:migrate:prod      # aplica migraciones en producción
npx prisma migrate dev --name <nombre>   # nueva migración local
```

---

## Estructura de páginas

### Públicas
| Ruta | Archivo | Descripción |
|---|---|---|
| `/` | `src/app/page.tsx` | Homepage: Hero → Stats → Categorías → **Producto del Mes** → ¿Cómo funciona? → Destacados → ¿Por qué elegirnos? → Testimonios |
| `/catalogo` | `src/app/catalogo/page.tsx` | Catálogo con filtro `?categoria=<slug>`. El slug filtra contra categoría Y subcategoría |
| `/producto/[slug]` | `src/app/producto/[slug]/page.tsx` | Detalle de producto. Renderiza `ImageGallery`, `CollectionView`, o `MassiveGallery` según flags |
| `/contacto` | `src/app/contacto/page.tsx` | Formulario de contacto |

### Admin (`/admin/*`)
| Ruta | Descripción |
|---|---|
| `/admin` | Dashboard |
| `/admin/productos` | Lista de productos |
| `/admin/productos/nuevo` | Crear producto |
| `/admin/productos/[id]` | Editar producto |
| `/admin/categorias` | CRUD categorías |
| `/admin/publicidad` | Programar anuncios para WhatsApp/FB/IG |
| `/admin/producto-del-mes` | Configurar imagen, texto y link del "Producto del Mes" |

---

## Componentes clave

### Homepage
- `FeaturedCarousel` — Carrusel drag-to-scroll con auto-scroll RAF. Abre `ProductModal` al clic
- `ProductOfMonth` — Imagen con marco LED animado (conic-gradient rotante). Props: `imageUrl`, `text?`, `link?`
- `CategoryGrid` — Grid de categorías con imágenes circulares
- `TestimonialsSection` — Testimonios de clientes

### Producto
- `ImageGallery` — Galería principal con miniaturas, lightbox (teclas ←→ Escape), soporte video
- `ModelSelector` — Para colecciones (`isCollection=true`): selector de modelo con lightbox y flechas
- `MassiveGallery` — Para +50 imágenes (`isMassiveGallery=true`): grid con buscador por nombre de archivo
- `CollectionView` — Vista de colección con precio por modelo

### Admin
- `ProductForm` — Formulario crear/editar producto. El slug se **auto-genera del título** (solo en nuevo producto, hasta que el usuario lo edite manualmente)

---

## API Routes admin

| Endpoint | Métodos | Descripción |
|---|---|---|
| `/api/admin/upload` | POST | Sube imagen (30MB, sharp compress) o video (50MB). **Preserva nombre original** del archivo. Videos con UUID |
| `/api/admin/products` | GET, POST | Lista / crea productos |
| `/api/admin/products/[id]` | GET, PUT, DELETE | |
| `/api/admin/categories` | GET, POST | |
| `/api/admin/categories/[id]` | GET, PUT, DELETE | |
| `/api/admin/product-of-month` | GET, PUT | Singleton SiteConfig |
| `/api/admin/ads` | GET, POST | Cola de anuncios |
| `/api/admin/generate-ad` | POST | Genera contenido con Claude Haiku |
| `/api/admin/generate-description` | POST | Genera descripción de producto con IA |
| `/api/admin/login` / `/api/admin/logout` | POST | Auth por token en cookie |

**Auth:** `requireAdmin()` desde `src/lib/auth.ts`, token en cookie `admin_token`.

---

## Subida de archivos

- Imágenes: JPEG, PNG, WebP, GIF — max 30MB — se comprimen con Sharp (1200x1200, quality 85) — **nombre original preservado** (sanitizado), sufijo UUID solo si hay colisión
- Videos: MP4, WebM — max 50MB — se guardan sin procesar con UUID
- Destino: `public/uploads/`
- Nginx configurado con `client_max_body_size 60M`
- Next.js configurado con `serverActions.bodySizeLimit: "60mb"`

---

## Tipos de producto

| Flag | Comportamiento en `/producto/[slug]` |
|---|---|
| normal | `ImageGallery` + `WhatsAppButton` |
| `isCollection=true` | `CollectionView` + `ModelSelector` (selector de modelo con lightbox) |
| `isMassiveGallery=true` | `MassiveGallery` (grid + buscador por nombre del diseño derivado del filename) |
| `isFeatured=true` | Aparece en `FeaturedCarousel` de la homepage |
| `variablePrice=true` | Muestra "Precio variable" en lugar del precio fijo |

---

## Publisher Bot (`publisher-bot/`)

- **Archivo:** `publisher-bot/index.js`
- **PM2 process:** `diamy-pub`
- **Tecnologías:** `whatsapp-web.js` + Puppeteer (headless), Meta Graph API v21.0
- **Cron:** cada minuto revisa `ads_queue` donde `status='scheduled' AND scheduleTime <= now`
- **Canales:** WhatsApp, Facebook (`/PAGE_ID/photos`), Instagram (two-step: `/media` → `/media_publish`)
- **DB:** Pool pg con `SET search_path TO "diamy_v4"` en cada conexión
- **Env:** carga `.env.production` del directorio padre (`../`)
- **Columnas Prisma (camelCase):** `scheduleTime`, `sentAt`, `errorLog`, `fbPostId`, `igPostId`

---

## Deploy / CI-CD

- **Repo:** `github.com/webfullstack77-max/diamy-web`
- **Workflow:** `app/.github/workflows/deploy.yml` — trigger automático en push a rama `main`
- **Secrets GitHub Actions:** `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PATH`
- **PM2 procesos en VPS:** `diamy` (Next.js), `diamy-pub` (publisher bot)
- **Nginx:** `/etc/nginx/sites-available/diamy`, `client_max_body_size 60M`

### Pasos del workflow (lo que ejecuta GitHub Actions en el VPS):
```
git pull origin main
npm install
npm run db:generate
npm run db:migrate:prod
npm run build
pm2 reload diamy --update-env
npm install --prefix publisher-bot
pm2 reload diamy-pub --update-env || pm2 start publisher-bot/index.js --name diamy-pub
```

### Cómo deployar

**Next.js (auto-deploy):**
```bash
# Desde app/ — cualquier push a main dispara el workflow
git push origin main
```

**Publisher-bot (NO se auto-despliega):**
El publisher-bot está en rama `master` (repo raíz). El workflow solo hace `git pull origin main`, por lo que cambios en `master` NO llegan al VPS automáticamente. Para aplicarlos:
```bash
# En VPS — después de hacer push a master en local:
cd /var/www/diamy && git pull origin master && pm2 restart diamy-pub
```
O aplicar con sed directamente en el VPS si es un cambio pequeño.

---

## Variables de entorno (`.env.production` en VPS, `.env.local` local)

```
DATABASE_URL                  postgresql://...?schema=diamy_v4
ADMIN_PASSWORD                contraseña del admin
NEXT_PUBLIC_WHATSAPP_NUMBER   número WhatsApp para CTAs
ANTHROPIC_API_KEY             para generate-description y generate-ad
NEXT_PUBLIC_SITE_URL          https://diamylasercut.com.mx
# Publisher bot:
FB_PAGE_ID
FB_PAGE_ACCESS_TOKEN
IG_USER_ID
WHATSAPP_GROUP_ID
DB_SCHEMA=diamy_v4
```

---

## Patrones y convenciones

- **Todos los Server Components** usan `export const dynamic = "force-dynamic"`
- **Prisma client:** importar desde `@/lib/prisma` (singleton)
- **Tailwind tokens:** `text-on-surface`, `text-on-surface-muted`, `bg-surface`, `bg-surface-container`, `text-primary`, `bg-primary`, `border-outline-variant`
- **Lightbox en modales:** usa `<img>` nativo (no `next/image`) con `// eslint-disable-next-line @next/next/no-img-element` para respetar proporciones naturales
- **Videos en galería:** filtrar con `isVideo(url)` → `/\.(mp4|webm)(\?|$)/i`
- **Catálogo con subcategoría:** usar `?categoria=<sub.slug>` (el filtro OR busca en category.slug Y subcategory.slug)
- **Migración schema:** siempre correr `npx prisma generate` después de migrar

---

## Dominio y hosting

- **Dominio:** diamylasercut.com.mx
- **VPS:** Ubuntu 24 (paquetes Chromium con sufijo `t64`, ej: `libatk1.0-0t64`)
- **Analytics:** Google Analytics G-LM2RYPD93F
