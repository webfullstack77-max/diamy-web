require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.production'), override: true });

async function checkToken() {
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!token) {
    console.error('No se encontró FB_PAGE_ACCESS_TOKEN en .env.production');
    process.exit(1);
  }
  
  console.log('Inspeccionando token (iniciando con ' + token.substring(0, 10) + ')...');
  
  try {
    // 1. Obtener información del token
    const debugUrl = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`;
    const debugRes = await fetch(debugUrl);
    const debugData = await debugRes.json();
    console.log('\n--- METADATA DEL TOKEN ---');
    console.log(JSON.stringify(debugData, null, 2));
    
    // 2. Obtener cuentas y páginas vinculadas
    const accountsUrl = `https://graph.facebook.com/v22.0/me/accounts?access_token=${token}`;
    const accountsRes = await fetch(accountsUrl);
    const accountsData = await accountsRes.json();
    console.log('\n--- PÁGINAS ASOCIADAS ---');
    console.log(JSON.stringify(accountsData, null, 2));
    
    // 3. Obtener cuentas de Instagram asociadas a la página
    const pageId = process.env.FB_PAGE_ID;
    if (pageId) {
      console.log(`\nConsultando Instagram Business Account asociada a la página ${pageId}...`);
      const igUrl = `https://graph.facebook.com/v22.0/${pageId}?fields=instagram_business_account&access_token=${token}`;
      const igRes = await fetch(igUrl);
      const igData = await igRes.json();
      console.log('--- INSTAGRAM VINCULADO ---');
      console.log(JSON.stringify(igData, null, 2));
    }
  } catch (err) {
    console.error('Error al realizar las consultas:', err.message);
  }
}

checkToken();
