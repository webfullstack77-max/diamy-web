const fs = require('fs');
const path = require('path');

const clientJsPath = path.join(__dirname, 'node_modules/whatsapp-web.js/src/Client.js');

if (!fs.existsSync(clientJsPath)) {
  console.log('[patch-wwebjs] Client.js no encontrado en', clientJsPath, '(omitiendo)');
  process.exit(0);
}

let content = fs.readFileSync(clientJsPath, 'utf8');

let modified = false;

// 1. Proteger evaluate en inject()
const injectTarget = `        while(start > (Date.now() - timeout)){
            res = await this.pupPage.evaluate('window.Debug?.VERSION != undefined');
            if(res){break;}
            await new Promise(r => setTimeout(r, 200));
        }`;

const injectReplacement = `        while(start > (Date.now() - timeout)){
            try {
                res = await this.pupPage.evaluate('window.Debug?.VERSION != undefined');
            } catch (e) {
                res = false;
            }
            if(res){break;}
            await new Promise(r => setTimeout(r, 200));
        }`;

if (content.includes(injectTarget)) {
  content = content.replace(injectTarget, injectReplacement);
  modified = true;
  console.log('[patch-wwebjs] Parche 1 aplicado: evaluate en inject() protegido.');
}

// 2. Proteger framenavigated
const frameNavTarget = `        this.pupPage.on('framenavigated', async (frame) => {
            if(frame.url().includes('post_logout=1') || this.lastLoggedOut) {
                this.emit(Events.DISCONNECTED, 'LOGOUT');
                await this.authStrategy.logout();
                await this.authStrategy.beforeBrowserInitialized();
                await this.authStrategy.afterBrowserInitialized();
                this.lastLoggedOut = false;
            }
            await this.inject();
        });`;

const frameNavReplacement = `        this.pupPage.on('framenavigated', async (frame) => {
            try {
                if(frame.url().includes('post_logout=1') || this.lastLoggedOut) {
                    this.emit(Events.DISCONNECTED, 'LOGOUT');
                    await this.authStrategy.logout();
                    await this.authStrategy.beforeBrowserInitialized();
                    await this.authStrategy.afterBrowserInitialized();
                    this.lastLoggedOut = false;
                }
                await this.inject();
            } catch (err) {
                // Previene caídas por 'Execution context was destroyed' durante navegación
            }
        });`;

if (content.includes(frameNavTarget)) {
  content = content.replace(frameNavTarget, frameNavReplacement);
  modified = true;
  console.log('[patch-wwebjs] Parche 2 aplicado: framenavigated protegido con try/catch.');
}

// 3. Proteger getWWebVersion
const versionTarget = `    async getWWebVersion() {
        return await this.pupPage.evaluate(() => {
            return window.Debug.VERSION;
        });
    }`;

const versionReplacement = `    async getWWebVersion() {
        try {
            return await this.pupPage.evaluate(() => {
                return window.Debug.VERSION;
            });
        } catch (err) {
            await new Promise(r => setTimeout(r, 500));
            try {
                return await this.pupPage.evaluate(() => {
                    return window.Debug.VERSION;
                });
            } catch (e) {
                return '2.3000.1000';
            }
        }
    }`;

if (content.includes(versionTarget)) {
  content = content.replace(versionTarget, versionReplacement);
  modified = true;
  console.log('[patch-wwebjs] Parche 3 aplicado: getWWebVersion protegido.');
}

if (modified) {
  fs.writeFileSync(clientJsPath, content, 'utf8');
  console.log('[patch-wwebjs] ✓ Archivo Client.js actualizado correctamente.');
} else {
  console.log('[patch-wwebjs] El archivo Client.js ya estaba parchado o los patrones ya no coinciden.');
}
