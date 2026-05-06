require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.production'), override: true });
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const cron = require('node-cron');
const { Pool } = require('pg');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

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
  const endpoint = `https://graph.facebook.com/v21.0/${pageId}/feed`;
  const params = new URLSearchParams({
    message: fullText,
    access_token: token,
    ...(imgUrl ? { link: imgUrl } : {}),
  });

  try {
    const res = await fetch(`${endpoint}?${params}`, { method: 'POST' });
    const data = await res.json();
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
    const createRes = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}/media?` +
        new URLSearchParams({ image_url: imgUrl, caption: fullText, access_token: token }),
      { method: 'POST' }
    );
    const createData = await createRes.json();
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
      const stRes = await fetch(
        `https://graph.facebook.com/v21.0/${createData.id}?fields=status_code,status&access_token=${token}`
      );
      const stData = await stRes.json();
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
    const publishRes = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}/media_publish?` +
        new URLSearchParams({ creation_id: createData.id, access_token: token }),
      { method: 'POST' }
    );
    const publishData = await publishRes.json();
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

  const itemIds = [];
  for (const imgUrl of images) {
    const url = buildImageUrl(imgUrl);
    if (!url) continue;
    try {
      const { url: preparedUrl, tempFile } = await prepareImageForInstagram(url);
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${igUserId}/media?` +
          new URLSearchParams({ image_url: preparedUrl, is_carousel_item: 'true', access_token: token }),
        { method: 'POST' }
      );
      const data = await res.json();
      if (data.id) itemIds.push(data.id);
      if (tempFile) { try { fs.unlinkSync(tempFile); } catch {} }
    } catch (err) {
      console.warn(`[IG Carousel] Error en imagen ${imgUrl}: ${err.message}`);
    }
  }

  if (itemIds.length < 2) return { ok: false, error: `Solo ${itemIds.length} imagen(es) válidas para carrusel (mínimo 2)` };

  try {
    const carouselRes = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}/media?` +
        new URLSearchParams({ media_type: 'CAROUSEL', caption: fullText, children: itemIds.join(','), access_token: token }),
      { method: 'POST' }
    );
    const carouselData = await carouselRes.json();
    if (carouselData.error) return { ok: false, error: carouselData.error.message };
    if (!carouselData.id) return { ok: false, error: 'No se obtuvo ID del contenedor carrusel' };

    // Polling status
    let statusCode = 'IN_PROGRESS';
    for (let i = 0; i < 8; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const stRes = await fetch(`https://graph.facebook.com/v21.0/${carouselData.id}?fields=status_code&access_token=${token}`);
      const stData = await stRes.json();
      statusCode = stData.status_code || 'UNKNOWN';
      if (statusCode !== 'IN_PROGRESS') break;
    }
    if (statusCode !== 'FINISHED') return { ok: false, error: `Estado carrusel: ${statusCode}` };

    const pubRes = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}/media_publish?` +
        new URLSearchParams({ creation_id: carouselData.id, access_token: token }),
      { method: 'POST' }
    );
    const pubData = await pubRes.json();
    if (pubData.error) return { ok: false, error: pubData.error.message };
    console.log(`[IG Carousel] Publicado, media_id: ${pubData.id}`);
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
  for (const imgUrl of images) {
    const url = buildImageUrl(imgUrl);
    if (!url) continue;
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${pageId}/photos?` +
          new URLSearchParams({ url, published: 'false', access_token: token }),
        { method: 'POST' }
      );
      const data = await res.json();
      if (data.id) photoIds.push(data.id);
    } catch (err) {
      console.warn(`[FB Album] Error subiendo imagen ${imgUrl}: ${err.message}`);
    }
  }

  if (photoIds.length < 2) return { ok: false, error: `Solo ${photoIds.length} foto(s) subidas (mínimo 2)` };

  try {
    const attachedMedia = photoIds.map((id) => JSON.stringify({ media_fbid: id })).join(',');
    const feedRes = await fetch(
      `https://graph.facebook.com/v21.0/${pageId}/feed?` +
        new URLSearchParams({ message: fullText, attached_media: `[${attachedMedia}]`, access_token: token }),
      { method: 'POST' }
    );
    const feedData = await feedRes.json();
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
    const createRes = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}/media?` +
        new URLSearchParams({ media_type: 'REELS', video_url: videoUrl, caption: fullText, share_to_feed: 'true', access_token: token }),
      { method: 'POST' }
    );
    const createData = await createRes.json();
    console.log('[IG Reel] Respuesta contenedor:', JSON.stringify(createData));
    if (createData.error) return { ok: false, error: createData.error.message };
    if (!createData.id) return { ok: false, error: `Contenedor sin ID: ${JSON.stringify(createData)}` };

    // Videos tardan más — hasta 8 min (50 intentos × 10s)
    let statusCode = 'IN_PROGRESS';
    for (let i = 0; i < 50; i++) {
      await new Promise((r) => setTimeout(r, 10000));
      const stRes = await fetch(`https://graph.facebook.com/v21.0/${createData.id}?fields=status_code,status&access_token=${token}`);
      const stData = await stRes.json();
      statusCode = stData.status_code || 'UNKNOWN';
      console.log(`[IG Reel] Estado (intento ${i + 1}): ${statusCode}`);
      if (statusCode !== 'IN_PROGRESS') break;
    }
    if (statusCode === 'ERROR') return { ok: false, error: 'El Reel falló al procesarse en Instagram' };
    if (statusCode !== 'FINISHED') return { ok: false, error: `Estado Reel inesperado: ${statusCode}` };

    const pubRes = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}/media_publish?` +
        new URLSearchParams({ creation_id: createData.id, access_token: token }),
      { method: 'POST' }
    );
    const pubData = await pubRes.json();
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
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pageId}/videos?` +
        new URLSearchParams({ file_url: videoUrl, description: fullText, access_token: token }),
      { method: 'POST' }
    );
    const data = await res.json();
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

console.log('Publisher Bot iniciado. Esperando a WhatsApp...');
