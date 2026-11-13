/* Configuración del Verificador de viabilidad de marca (landing-registro-marcas-cancun.html).
   Lo único que hay que poner a mano es la clave PÚBLICA del widget de Cloudflare Turnstile
   (Cloudflare → Turnstile → tu widget → "Site Key"). La clave SECRETA no va aquí: va en el
   Worker (secreto TURNSTILE_SECRET). Mientras `turnstileSiteKey` esté vacía, el verificador
   avisa que no está disponible y manda a WhatsApp; no llama a nada. */
window.VERIFICADOR_MARCA_CONFIG = {
    turnstileSiteKey: '',
    proxy: 'https://throbbing-scene-1c2b.enlilh.workers.dev',
    whatsapp: '529982570828'
};
