require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.production') });
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const cron = require('node-cron');
const { Pool } = require('pg');

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
      const imgUrl = buildImageUrl(ad.image_url);
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

  const imgUrl = buildImageUrl(ad.image_url);
  const endpoint = `https://graph.facebook.com/v21.0/${pageId}/photos`;
  const params = new URLSearchParams({
    message: fullText,
    access_token: token,
    ...(imgUrl ? { url: imgUrl } : {}),
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

async function publishInstagram(ad, fullText) {
  const igUserId = process.env.IG_USER_ID;
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!igUserId || !token) {
    console.warn('[IG] IG_USER_ID o FB_PAGE_ACCESS_TOKEN no configurados');
    return { ok: false, error: 'Credenciales IG no configuradas' };
  }

  const imgUrl = buildImageUrl(ad.image_url);
  if (!imgUrl) return { ok: false, error: 'Se requiere imagen para Instagram' };

  try {
    // Paso 1: crear contenedor
    const createRes = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}/media?` +
        new URLSearchParams({ image_url: imgUrl, caption: fullText, access_token: token }),
      { method: 'POST' }
    );
    const createData = await createRes.json();
    if (createData.error) {
      console.error('[IG] Error al crear contenedor:', createData.error.message);
      return { ok: false, error: createData.error.message };
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

    const fullText = [ad.caption, ad.hashtags].filter(Boolean).join('\n\n');
    const errors = [];
    let fbPostId = null;
    let igPostId = null;

    if (channels.includes('whatsapp')) {
      console.log(`[AD ${ad.id}] Enviando a WhatsApp...`);
      const r = await sendWhatsApp(ad, fullText);
      if (!r.ok) errors.push(`WA: ${r.error}`);
    }

    if (channels.includes('facebook')) {
      console.log(`[AD ${ad.id}] Publicando en Facebook...`);
      const r = await publishFacebook(ad, fullText);
      if (r.ok) fbPostId = r.postId;
      else errors.push(`FB: ${r.error}`);
    }

    if (channels.includes('instagram')) {
      console.log(`[AD ${ad.id}] Publicando en Instagram...`);
      const r = await publishInstagram(ad, fullText);
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
