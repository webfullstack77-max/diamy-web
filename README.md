# Diamy — Catálogo Web

Sitio web de catálogo para corte láser y grabado personalizado. Construido con Next.js 16, Tailwind CSS v4, Prisma 7 y PostgreSQL.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend + Backend | Next.js 16 (App Router) + TypeScript |
| Estilos | Tailwind CSS v4 |
| Base de datos | PostgreSQL 16 |
| ORM | Prisma 7 + @prisma/adapter-pg |

---

## Setup local

### 1. Requisitos previos

- Node.js 20+
- Docker Desktop (para PostgreSQL)

### 2. Instalar dependencias

```bash
npm install
```

### 3. Variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/diamy_db?schema=diamy_v4"
DB_SCHEMA="diamy_v4"
NEXT_PUBLIC_WHATSAPP_NUMBER="521234567890"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
ADMIN_PASSWORD_HASH=""  # ver paso siguiente
```

### 4. Generar hash de contraseña admin

```bash
node -e "require('bcryptjs').hash('tu_password_segura', 10).then(console.log)"
```

Copia el resultado a `ADMIN_PASSWORD_HASH` en `.env.local`.

### 5. Base de datos

```bash
docker-compose up -d          # levanta PostgreSQL
npm run db:migrate             # aplica el schema
npm run db:generate            # genera cliente Prisma
npm run db:seed                # carga datos de ejemplo
```

### 6. Servidor de desarrollo

```bash
npm run dev
```

- Sitio: http://localhost:3000
- Admin: http://localhost:3000/admin (contraseña: la que configuraste)

---

## Comandos

```bash
npm run dev           # desarrollo
npm run build         # build producción
npm run start         # servidor producción
npm run db:studio     # Prisma Studio GUI
npm run db:migrate    # nuevas migraciones
npm run db:seed       # re-sembrar datos de ejemplo
```

---

## Deploy en VPS

### Preparar servidor

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 + Nginx
npm install -g pm2
sudo apt install nginx postgresql
```

### Desplegar

```bash
git clone https://github.com/tu-usuario/diamy-web.git /var/www/diamy
cd /var/www/diamy
npm install
cp .env.example .env.local   # editar con valores reales
npm run db:migrate
npm run db:generate
npm run build
pm2 start ecosystem.config.js --env production
pm2 save && pm2 startup
```

### Nginx

```bash
sudo cp nginx.conf /etc/nginx/sites-available/diamy
# Editar server_name con tu dominio
sudo ln -s /etc/nginx/sites-available/diamy /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

### Actualizar en producción

```bash
cd /var/www/diamy
git pull origin main
npm install
npm run db:migrate
npm run db:generate
npm run build
pm2 restart diamy
```

---

## Estructura

```
src/
├── app/
│   ├── page.tsx               # Inicio
│   ├── catalogo/              # Catálogo con filtros
│   ├── producto/[slug]/       # Detalle de producto
│   ├── admin/                 # Panel admin
│   └── api/                   # API routes
├── components/
│   ├── layout/                # Header, Footer, MobileNav
│   ├── home/                  # CategoryGrid, Testimonials
│   ├── catalog/               # ProductCard, FilterSidebar
│   ├── product/               # ImageGallery, WhatsAppButton
│   └── admin/                 # ProductForm, LogoutButton
├── lib/
│   ├── prisma.ts              # Singleton Prisma client
│   ├── auth.ts                # Sesión admin
│   └── whatsapp.ts            # URL WhatsApp
└── types/index.ts             # Interfaces TypeScript
prisma/
├── schema.prisma              # Modelos
├── migrations/                # Historial
└── seed.ts                    # Datos de ejemplo
```
