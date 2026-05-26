require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.production'), override: true });
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const cron = require('node-cron');
const { Pool } = require('pg');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const webpush = require('web-push');

// ── Web Push (VAPID) ─────────────────────────────────────────────────────────
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:webfullstack77@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// ── PostgreSQL ──────────────────────────────────────────────────────────────
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Establecer search_path al schema correcto en cada nueva conexión
pool.on('connect', async (client) => {
  const schema = process.env.DB_SCHEMA || 'diamy_v4';
  await client.query(`SET search_path TO "${schema}"`);
});

async function query(sql, params) {
  const { rows } = await pool.query(sql, params);
  return rows;
}

// ── WhatsApp Client ─────────────────────────────────────────────────────────
let waReady = false;

const waClient = new Client({
  authStrategy: new LocalAuth({ dataPath: './sessions' }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
    timeout: 60000,
  },
});

waClient.on('qr', (qr) => {
  console.log('\n=== Escanea este QR con WhatsApp ===');
  qrcode.toString(qr, { type: 'terminal', small: true }, (err, str) => {
    if (!err) console.log(str);
  });
});

waClient.on('ready', () => {
  console.log('[WA] WhatsApp listo!');
  waReady = true;
});

waClient.on('disconnected', () => {
  console.log('[WA] WhatsApp desconectado');
  waReady = false;
});

waClient.initialize();

// ── Helpers ─────────────────────────────────────────────────────────────────
function buildImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  const base = (process.env.APP_URL || 'https://diamylasercut.com.mx').replace(/\/$/, '');
  return `${base}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
}

const GRAPH_API = 'https://graph.facebook.com/v22.0';

async function graphPost(endpoint, params) {
  const body = new URLSearchParams(params);
  const res = await fetch(`${GRAPH_API}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  return res.json();
}

async function graphGet(endpoint, params) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${GRAPH_API}/${endpoint}?${qs}`);
  return res.json();
}

async function sendWhatsApp(ad, fullText) {
  const groupNames = (process.env.WA_TARGET_GROUP || '').split(',').map((n) => n.trim()).filter(Boolean);
  if (groupNames.length === 0) {
    console.warn('[WA] WA_TARGET_GROUP no configurado');
    return { ok: false, error: 'WA_TARGET_GROUP no configurado' };
  }
  if (!waReady) return { ok: false, error: 'WhatsApp no conectado' };

  const chats = await waClient.getChats();
  const errors = [];

  for (const name of groupNames) {
    const chat = chats.find((c) => c.name === name);
    if (!chat) {
      errors.push(`Grupo "${name}" no encontrado`);
      continue;
    }
    try {
      const imgUrl = buildImageUrl(ad.imageUrl);
      if (imgUrl) {
        const media = await MessageMedia.fromUrl(imgUrl, { unsafeMime: true });
        await waClient.sendMessage(chat.id._serialized, media, { caption: fullText });
      } else {
        await waClient.sendMessage(chat.id._serialized, fullText);
      }
      console.log(`[WA] Enviado a "${name}"`);
    } catch (err) {
      errors.push(`${name}: ${err.message}`);
    }
  }

  return errors.length === 0 ? { ok: true } : { ok: false, error: errors.join(' | ') };
}

async function publishFacebook(ad, fullText) {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) {
    console.warn('[FB] FB_PAGE_ID o FB_PAGE_ACCESS_TOKEN no configurados');
    return { ok: false, error: 'Credenciales FB no configuradas' };
  }

  const imgUrl = buildImageUrl(ad.imageUrl);
  try {
    const data = await graphPost(`${pageId}/feed`, {
      message: fullText,
      access_token: token,
      ...(imgUrl ? { link: imgUrl } : {}),
    });
    if (data.error) {
      console.error('[FB] Error:', data.error.message);
      return { ok: false, error: data.error.message };
    }
    console.log('[FB] Publicado, post_id:', data.id);
    return { ok: true, postId: data.id };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// Instagram requires aspect ratio between 4:5 (0.8) and 1.91:1 (1.91).
// If the image is outside that range, resize to 1080x1080 square and save temporarily.
async function prepareImageForInstagram(imgUrl) {
  const res = await fetch(imgUrl);
  if (!res.ok) throw new Error(`No se pudo descargar la imagen: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());

  const meta = await sharp(buf).metadata();
  const ratio = meta.width / meta.height;

  if (ratio >= 0.8 && ratio <= 1.91) {
    return { url: imgUrl, tempFile: null };
  }

  console.log(`[IG] Relación de aspecto ${ratio.toFixed(2)} fuera de rango, redimensionando a 1080x1080`);
  const resized = await sharp(buf)
    .resize(1080, 1080, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 85 })
    .toBuffer();

  const filename = `_ig_${randomUUID()}.jpg`;
  const uploadDir = path.join(__dirname, '../public/uploads');
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, resized);

  const base = (process.env.APP_URL || 'https://diamylasercut.com.mx').replace(/\/$/, '');
  return { url: `${base}/uploads/${filename}`, tempFile: filePath };
}

async function publishInstagram(ad, fullText) {
  const igUserId = process.env.IG_USER_ID;
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!igUserId || !token) {
    console.warn('[IG] IG_USER_ID o FB_PAGE_ACCESS_TOKEN no configurados');
    return { ok: false, error: 'Credenciales IG no configuradas' };
  }

  const rawImgUrl = buildImageUrl(ad.imageUrl);
  if (!rawImgUrl) return { ok: false, error: 'Se requiere imagen para Instagram' };

  let imgUrl, tempFile;
  try {
    ({ url: imgUrl, tempFile } = await prepareImageForInstagram(rawImgUrl));
  } catch (err) {
    return { ok: false, error: `Error preparando imagen: ${err.message}` };
  }

  try {
    // Paso 1: crear contenedor
    const createData = await graphPost(`${igUserId}/media`, {
      image_url: imgUrl, caption: fullText, access_token: token,
    });
    console.log('[IG] Respuesta contenedor:', JSON.stringify(createData));
    if (createData.error) {
      console.error('[IG] Error al crear contenedor:', createData.error.message);
      return { ok: false, error: createData.error.message };
    }
    if (!createData.id) {
      return { ok: false, error: `Contenedor sin ID: ${JSON.stringify(createData)}` };
    }

    // Paso 1b: esperar a que el contenedor esté listo
    let statusCode = 'IN_PROGRESS';
    for (let i = 0; i < 8; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const stData = await graphGet(createData.id, {
        fields: 'status_code,status', access_token: token,
      });
      statusCode = stData.status_code || 'UNKNOWN';
      console.log(`[IG] Estado contenedor (intento ${i + 1}): ${statusCode}`);
      if (statusCode !== 'IN_PROGRESS') break;
    }
    if (statusCode === 'ERROR') {
      return { ok: false, error: 'El contenedor IG falló al procesar la imagen (revisa dimensiones o formato)' };
    }
    if (statusCode !== 'FINISHED') {
      return { ok: false, error: `Contenedor IG en estado inesperado: ${statusCode}` };
    }

    // Paso 2: publicar
    const publishData = await graphPost(`${igUserId}/media_publish`, {
      creation_id: createData.id, access_token: token,
    });
    if (publishData.error) {
      console.error('[IG] Error al publicar:', publishData.error.message);
      return { ok: false, error: publishData.error.message };
    }

    console.log('[IG] Publicado, media_id:', publishData.id);
    return { ok: true, postId: publishData.id };
  } catch (err) {
    return { ok: false, error: err.message };
  } finally {
    if (tempFile) {
      try { fs.unlinkSync(tempFile); } catch {}
    }
  }
}

// ── Instagram Carousel ──────────────────────────────────────────────────────
async function publishInstagramCarousel(ad, fullText) {
  const igUserId = process.env.IG_USER_ID;
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!igUserId || !token) return { ok: false, error: 'Credenciales IG no configuradas' };

  let images;
  try { images = JSON.parse(ad.imageUrls); } catch { return { ok: false, error: 'imageUrls inválido' }; }

  console.log(`[IG Carousel] Procesando ${images.length} imagen(es)...`);

  // ── Paso 1: Crear contenedores individuales para cada imagen ──
  const itemIds = [];
  const igApiErrors = [];
  const tempFiles = [];
  for (let idx = 0; idx < images.length; idx++) {
    const imgUrl = images[idx];
    const url = buildImageUrl(imgUrl);
    if (!url) continue;
    try {
      const { url: preparedUrl, tempFile } = await prepareImageForInstagram(url);
      if (tempFile) tempFiles.push(tempFile);
      console.log(`[IG Carousel] Creando item ${idx + 1}/${images.length}: ${preparedUrl}`);
      const data = await graphPost(`${igUserId}/media`, {
        image_url: preparedUrl, is_carousel_item: 'true', access_token: token,
      });
      if (data.id) {
        itemIds.push(data.id);
        console.log(`[IG Carousel] Item ${idx + 1} creado, container_id: ${data.id}`);
      } else {
        const errMsg = data.error ? `${data.error.message} (code ${data.error.code})` : JSON.stringify(data);
        igApiErrors.push(errMsg);
        console.warn(`[IG Carousel] Meta rechazó imagen ${imgUrl}: ${errMsg}`);
      }
    } catch (err) {
      igApiErrors.push(err.message);
      console.warn(`[IG Carousel] Error en imagen ${imgUrl}: ${err.message}`);
    }
  }

  if (itemIds.length < 2) {
    tempFiles.forEach((f) => { try { fs.unlinkSync(f); } catch {} });
    return { ok: false, error: `Solo ${itemIds.length} imagen(es) válidas para carrusel (mínimo 2). Error Meta: ${igApiErrors[0] ?? 'desconocido'}` };
  }

  // ── Paso 2: Esperar a que CADA item termine de procesarse ──
  console.log(`[IG Carousel] Esperando que ${itemIds.length} items terminen de procesarse...`);
  for (let idx = 0; idx < itemIds.length; idx++) {
    const itemId = itemIds[idx];
    let itemStatus = 'IN_PROGRESS';
    for (let attempt = 0; attempt < 20; attempt++) {
      await new Promise((r) => setTimeout(r, 3000));
      const stData = await graphGet(itemId, {
        fields: 'status_code', access_token: token,
      });
      itemStatus = stData.status_code || 'IN_PROGRESS';
      console.log(`[IG Carousel] Item ${idx + 1} (${itemId}) intento ${attempt + 1}: ${itemStatus}`);
      if (itemStatus !== 'IN_PROGRESS') break;
    }
    if (itemStatus === 'ERROR') {
      tempFiles.forEach((f) => { try { fs.unlinkSync(f); } catch {} });
      return { ok: false, error: `Item ${idx + 1} falló al procesarse en Instagram` };
    }
    if (itemStatus !== 'FINISHED') {
      tempFiles.forEach((f) => { try { fs.unlinkSync(f); } catch {} });
      return { ok: false, error: `Item ${idx + 1} en estado inesperado: ${itemStatus}` };
    }
    console.log(`[IG Carousel] ✓ Item ${idx + 1} listo`);
  }

  // Limpiar archivos temporales después de que Instagram ya descargó todas las imágenes
  tempFiles.forEach((f) => { try { fs.unlinkSync(f); } catch {} });
  console.log(`[IG Carousel] Archivos temporales limpiados (${tempFiles.length})`);


  // ── Paso 3: Crear el contenedor del carrusel ──
  try {
    console.log(`[IG Carousel] Creando contenedor carrusel con ${itemIds.length} items...`);
    const carouselData = await graphPost(`${igUserId}/media`, {
      media_type: 'CAROUSEL', caption: fullText, children: itemIds.join(','), access_token: token,
    });
    if (carouselData.error) return { ok: false, error: carouselData.error.message };
    if (!carouselData.id) return { ok: false, error: 'No se obtuvo ID del contenedor carrusel' };
    console.log(`[IG Carousel] Contenedor carrusel creado: ${carouselData.id}`);

    // ── Paso 4: Esperar a que el carrusel termine de procesarse ──
    let statusCode = 'IN_PROGRESS';
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const stData = await graphGet(carouselData.id, {
        fields: 'status_code', access_token: token,
      });
      statusCode = stData.status_code || 'IN_PROGRESS';
      console.log(`[IG Carousel] Estado carrusel (intento ${i + 1}): ${statusCode}`);
      if (statusCode !== 'IN_PROGRESS') break;
    }
    if (statusCode !== 'FINISHED') return { ok: false, error: `Estado carrusel: ${statusCode}` };

    // ── Paso 5: Publicar ──
    const pubData = await graphPost(`${igUserId}/media_publish`, {
      creation_id: carouselData.id, access_token: token,
    });
    if (pubData.error) return { ok: false, error: pubData.error.message };
    console.log(`[IG Carousel] ✓ Publicado exitosamente, media_id: ${pubData.id}`);
    return { ok: true, postId: pubData.id };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Facebook Album (multi-foto) ─────────────────────────────────────────────
async function publishFacebookAlbum(ad, fullText) {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) return { ok: false, error: 'Credenciales FB no configuradas' };

  let images;
  try { images = JSON.parse(ad.imageUrls); } catch { return { ok: false, error: 'imageUrls inválido' }; }

  const photoIds = [];
  const fbApiErrors = [];
  for (const imgUrl of images) {
    const url = buildImageUrl(imgUrl);
    if (!url) continue;
    try {
      const data = await graphPost(`${pageId}/photos`, {
        url, published: 'false', access_token: token,
      });
      if (data.id) {
        photoIds.push(data.id);
      } else {
        const errMsg = data.error ? `${data.error.message} (code ${data.error.code})` : JSON.stringify(data);
        fbApiErrors.push(errMsg);
        console.warn(`[FB Album] Meta rechazó imagen ${imgUrl}: ${errMsg}`);
      }
    } catch (err) {
      fbApiErrors.push(err.message);
      console.warn(`[FB Album] Error subiendo imagen ${imgUrl}: ${err.message}`);
    }
  }

  if (photoIds.length < 2) return { ok: false, error: `Solo ${photoIds.length} foto(s) subidas (mínimo 2). Error Meta: ${fbApiErrors[0] ?? 'desconocido'}` };

  try {
    const attachedMedia = photoIds.map((id) => JSON.stringify({ media_fbid: id })).join(',');
    const feedData = await graphPost(`${pageId}/feed`, {
      message: fullText, attached_media: `[${attachedMedia}]`, access_token: token,
    });
    if (feedData.error) return { ok: false, error: feedData.error.message };
    console.log(`[FB Album] Publicado, post_id: ${feedData.id}`);
    return { ok: true, postId: feedData.id };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Instagram Reel (video) ──────────────────────────────────────────────────
async function publishInstagramReel(ad, fullText) {
  const igUserId = process.env.IG_USER_ID;
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!igUserId || !token) return { ok: false, error: 'Credenciales IG no configuradas' };

  const videoUrl = buildImageUrl(ad.videoUrl);
  if (!videoUrl) return { ok: false, error: 'videoUrl no disponible' };

  try {
    const createData = await graphPost(`${igUserId}/media`, {
      media_type: 'REELS', video_url: videoUrl, caption: fullText, share_to_feed: 'true', access_token: token,
    });
    console.log('[IG Reel] Respuesta contenedor:', JSON.stringify(createData));
    if (createData.error) return { ok: false, error: createData.error.message };
    if (!createData.id) return { ok: false, error: `Contenedor sin ID: ${JSON.stringify(createData)}` };

    // Videos tardan más — hasta 8 min (50 intentos × 10s)
    let statusCode = 'IN_PROGRESS';
    for (let i = 0; i < 50; i++) {
      await new Promise((r) => setTimeout(r, 10000));
      const stData = await graphGet(createData.id, {
        fields: 'status_code,status', access_token: token,
      });
      statusCode = stData.status_code || 'UNKNOWN';
      console.log(`[IG Reel] Estado (intento ${i + 1}): ${statusCode}`);
      if (statusCode !== 'IN_PROGRESS') break;
    }
    if (statusCode === 'ERROR') return { ok: false, error: 'El Reel falló al procesarse en Instagram' };
    if (statusCode !== 'FINISHED') return { ok: false, error: `Estado Reel inesperado: ${statusCode}` };

    const pubData = await graphPost(`${igUserId}/media_publish`, {
      creation_id: createData.id, access_token: token,
    });
    if (pubData.error) return { ok: false, error: pubData.error.message };
    console.log(`[IG Reel] Publicado, media_id: ${pubData.id}`);
    return { ok: true, postId: pubData.id };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Facebook Video ──────────────────────────────────────────────────────────
async function publishFacebookVideo(ad, fullText) {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) return { ok: false, error: 'Credenciales FB no configuradas' };

  const videoUrl = buildImageUrl(ad.videoUrl);
  if (!videoUrl) return { ok: false, error: 'videoUrl no disponible' };

  try {
    const data = await graphPost(`${pageId}/videos`, {
      file_url: videoUrl, description: fullText, access_token: token,
    });
    if (data.error) return { ok: false, error: data.error.message };
    console.log(`[FB Video] Publicado, id: ${data.id}`);
    return { ok: true, postId: data.id };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── Cron: cada minuto ───────────────────────────────────────────────────────
cron.schedule('* * * * *', async () => {
  const now = new Date().toISOString();

  let ads;
  try {
    ads = await query(
      `SELECT * FROM ads_queue WHERE status = 'scheduled' AND "scheduleTime" <= $1`,
      [now]
    );
  } catch (err) {
    console.error('[CRON] Error al consultar BD:', err.message);
    return;
  }

  if (ads.length === 0) return;
  console.log(`[CRON] ${ads.length} anuncio(s) para procesar`);

  for (const ad of ads) {
    let channels = [];
    try { channels = JSON.parse(ad.channels || '[]'); } catch { channels = ['whatsapp']; }

    const productUrl = ad.productUrl ? buildImageUrl(ad.productUrl) : null;
    const fullText = [ad.caption, ad.hashtags, productUrl ? `👉 ${productUrl}` : null].filter(Boolean).join('\n\n');
    const errors = [];
    let fbPostId = null;
    let igPostId = null;

    const hasVideo = !!ad.videoUrl;
    const hasCarousel = (() => { try { return ad.imageUrls && JSON.parse(ad.imageUrls).length > 1; } catch { return false; } })();

    if (channels.includes('whatsapp')) {
      console.log(`[AD ${ad.id}] Enviando a WhatsApp...`);
      const r = await sendWhatsApp(ad, fullText);
      if (!r.ok) errors.push(`WA: ${r.error}`);
    }

    if (channels.includes('facebook')) {
      console.log(`[AD ${ad.id}] Publicando en Facebook (${hasVideo ? 'video' : hasCarousel ? 'álbum' : 'imagen'})...`);
      const r = hasVideo
        ? await publishFacebookVideo(ad, fullText)
        : hasCarousel
          ? await publishFacebookAlbum(ad, fullText)
          : await publishFacebook(ad, fullText);
      if (r.ok) fbPostId = r.postId;
      else errors.push(`FB: ${r.error}`);
    }

    if (channels.includes('instagram')) {
      console.log(`[AD ${ad.id}] Publicando en Instagram (${hasVideo ? 'reel' : hasCarousel ? 'carrusel' : 'imagen'})...`);
      const r = hasVideo
        ? await publishInstagramReel(ad, fullText)
        : hasCarousel
          ? await publishInstagramCarousel(ad, fullText)
          : await publishInstagram(ad, fullText);
      if (r.ok) igPostId = r.postId;
      else errors.push(`IG: ${r.error}`);
    }

    const attempted = channels.length;
    const failed = errors.length;
    const status = failed === 0 ? 'sent' : failed === attempted ? 'failed' : 'partial';

    try {
      await query(
        `UPDATE ads_queue SET status=$1, "sentAt"=$2, "errorLog"=$3, "fbPostId"=$4, "igPostId"=$5 WHERE id=$6`,
        [
          status,
          status !== 'failed' ? new Date().toISOString() : null,
          errors.length > 0 ? errors.join(' | ') : null,
          fbPostId,
          igPostId,
          ad.id,
        ]
      );
      console.log(`[AD ${ad.id}] → ${status}`);
    } catch (err) {
      console.error(`[AD ${ad.id}] Error al actualizar BD:`, err.message);
    }
  }
});

// ── Auto-publish cron: 3 AM UTC = 9 PM México CDT (UTC-6) ──────────────────
// En invierno (CST, UTC-7): cambiar a '0 4 * * *'
cron.schedule('0 3 * * *', async () => {
  console.log('[AUTO] Revisando configuración de autopiloto...');

  let config;
  try {
    const rows = await query('SELECT * FROM auto_publish_config LIMIT 1');
    config = rows[0];
  } catch (err) {
    console.error('[AUTO] Error leyendo config:', err.message);
    return;
  }

  if (!config || !config.enabled) {
    console.log('[AUTO] Autopiloto desactivado, omitiendo.');
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  if (config.nextPublishDate && today < config.nextPublishDate) {
    console.log(`[AUTO] Día de descanso. Próxima publicación: ${config.nextPublishDate}`);
    return;
  }

  let product;
  try {
    const rows = await query(`SELECT * FROM "Product" WHERE "isActive"=true ORDER BY random() LIMIT 1`);
    product = rows[0];
  } catch (err) {
    console.error('[AUTO] Error consultando producto:', err.message);
    return;
  }

  if (!product) {
    console.log('[AUTO] No hay productos activos disponibles.');
    return;
  }

  const imgs = (product.images || []).slice(0, 5);
  if (!imgs.length) {
    console.log(`[AUTO] Producto "${product.title}" no tiene imágenes, omitiendo.`);
    return;
  }

  const price = product.variablePrice ? 'Precio variable' : `$${product.price}`;
  const caption = `🛍️ ${product.title}\n\n${product.description}\n\n💰 ${price}`;
  const productUrl = `/producto/${product.slug}`;
  const channels = config.channels || '["whatsapp"]';
  const now = new Date().toISOString();

  try {
    await query(
      `INSERT INTO ads_queue (id, title, "imageUrl", "imageUrls", caption, channels, "productUrl", "scheduleTime", status, "createdAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'scheduled',$9)`,
      [
        randomUUID(),
        product.title,
        imgs[0],
        imgs.length > 1 ? JSON.stringify(imgs) : null,
        caption,
        channels,
        productUrl,
        now,
        now,
      ]
    );
    console.log(`[AUTO] Anuncio creado para "${product.title}" (${imgs.length} imagen(es))`);
  } catch (err) {
    console.error('[AUTO] Error insertando anuncio:', err.message);
    return;
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 2);
  try {
    await query(
      `UPDATE auto_publish_config SET "nextPublishDate"=$1, "lastPublishedAt"=$2, "lastProductId"=$3, "lastProductTitle"=$4, "updatedAt"=$5 WHERE id=$6`,
      [nextDate.toISOString().split('T')[0], now, product.id, product.title, now, config.id]
    );
    console.log(`[AUTO] Config actualizada. Próxima publicación: ${nextDate.toISOString().split('T')[0]}`);
  } catch (err) {
    console.error('[AUTO] Error actualizando config:', err.message);
  }
});

// ── Cron: alertas de entregas — 8 AM hora México (14:00 UTC) ─────────────────
cron.schedule('0 14 * * *', async () => {
  console.log('[ORDERS] Revisando entregas próximas...');

  const today = new Date().toISOString().split('T')[0];
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  dayAfterTomorrow.setHours(23, 59, 59, 999);

  let orders;
  try {
    orders = await query(
      `SELECT * FROM orders WHERE status NOT IN ('DELIVERED', 'CANCELLED') AND "deliveryDate" <= $1 AND ("alertSentDate" IS NULL OR "alertSentDate" < $2)`,
      [dayAfterTomorrow.toISOString(), today]
    );
  } catch (err) {
    console.error('[ORDERS] Error consultando pedidos:', err.message);
    return;
  }

  if (orders.length === 0) {
    console.log('[ORDERS] Sin alertas pendientes.');
    return;
  }

  console.log(`[ORDERS] ${orders.length} pedido(s) requieren alerta.`);

  let subscriptions = [];
  try {
    subscriptions = await query('SELECT * FROM push_subscriptions');
  } catch (err) {
    console.error('[ORDERS] Error obteniendo suscripciones push:', err.message);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://diamylasercut.com.mx';
  const adminWaNumber = process.env.ADMIN_WA_NUMBER;

  for (const order of orders) {
    const deliveryStr = new Date(order.deliveryDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
    const isOverdue = new Date(order.deliveryDate) < new Date();
    const title = isOverdue ? '⚠️ Entrega vencida' : '🔔 Entrega próxima';
    const body = `${order.clientName} — ${(order.description || '').substring(0, 60)} (${deliveryStr})`;
    const url = `${siteUrl}/admin/pedidos/${order.id}`;

    // 1. Push notification
    if (process.env.VAPID_PUBLIC_KEY && subscriptions.length > 0) {
      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify({ title, body, url })
          );
        } catch (err) {
          if (err.statusCode === 410) {
            await query('DELETE FROM push_subscriptions WHERE endpoint = $1', [sub.endpoint]).catch(() => {});
          } else {
            console.error('[ORDERS] Push error:', err.message);
          }
        }
      }
    }

    // 2. WhatsApp al admin
    if (adminWaNumber && waReady) {
      try {
        const chatId = `${adminWaNumber}@c.us`;
        const msg = `${title}\n\n📦 *${order.clientName}*\n${(order.description || '').substring(0, 80)}\n📅 Entrega: ${deliveryStr}\n\n${url}`;
        await waClient.sendMessage(chatId, msg);
        console.log(`[ORDERS] WA enviado a admin para pedido ${order.id}`);
      } catch (err) {
        console.error('[ORDERS] WA error:', err.message);
      }
    }

    // 3. Actualizar alertSentDate
    try {
      await query('UPDATE orders SET "alertSentDate" = $1 WHERE id = $2', [today, order.id]);
    } catch (err) {
      console.error('[ORDERS] Error actualizando alertSentDate:', err.message);
    }
  }
});

console.log('Publisher Bot iniciado. Esperando a WhatsApp...');
