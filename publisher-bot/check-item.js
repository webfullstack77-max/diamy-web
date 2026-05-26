require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.production'), override: true });

async function checkContainer() {
  const containerId = process.argv[2];
  if (!containerId) {
    console.error('Por favor especifica el ID del contenedor. Ejemplo: node check-item.js 17883881613665570');
    process.exit(1);
  }
  
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!token) {
    console.error('No se encontró FB_PAGE_ACCESS_TOKEN en .env.production');
    process.exit(1);
  }
  
  console.log(`Consultando estado del contenedor ${containerId}...`);
  const url = `https://graph.facebook.com/v22.0/${containerId}?fields=status_code,status,error_message,error_subcode&access_token=${token}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log('--- RESPUESTA DE META ---');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error al realizar la consulta:', err.message);
  }
}

checkContainer();
