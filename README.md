# Empírica Legal Lab — Sitio Web

Sitio web moderno para **Empírica Legal Lab** — despacho jurídico enfocado en emprendedores.

## Estructura

```
├── index.html                    # Página principal (español)
├── en.html                       # La misma página en inglés: un cambio en una va también en la otra
├── landing-*.html                # Una página por servicio (las de disputas, en español y en inglés)
│   ├── landing-amparo-cancun.html          # Abogado de amparo en Cancún (misma plantilla que edictos)
│   └── landing-registro-marcas-cancun.html # Registro de marcas en Cancún + Verificador de viabilidad de marca
├── abogado-*.html, abogada-*.html, lawyer-*.html
│                                 # Perfiles de los socios, en español y en inglés
├── css/styles.css                # Estilos (responsive, animaciones)
├── css/verificador-marca.css     # Estilos del verificador de marca
├── js/verificador-config.js      # Clave pública de Turnstile y URL del Worker (lo único que se edita a mano)
├── js/verificador-marca.js       # Interfaz del verificador (formulario, semáforo, desbloqueo con datos de contacto)
├── js/verificador-marca-motor.js # GENERADO desde la app (TSJ_Filing_online): no se edita a mano
├── js/main.js                    # JavaScript (modales, Stripe, formularios)
├── assets/images/
│   ├── logo/                     # Coloca tu logo aquí
│   ├── services/                 # Imágenes de servicios (opcional)
│   └── hero/                     # Foto para "Sobre Nosotros"
├── apps-script/                  # Google Apps Script (reseñas, newsletter)
│                                 #   se despliega solo desde GitHub: ver apps-script/README.md
├── CNAME                         # Dominio personalizado
└── .gitignore
```

## Configuración Rápida

### 1. Logos e Imágenes
Revisa los archivos `COLOCA-*.md` en cada carpeta de `assets/images/` para saber qué archivos necesitas.

### 2. Stripe Payment Links
Edita `js/main.js` y reemplaza los valores en el objeto `STRIPE_LINKS` con tus Payment Links de Stripe:
1. Ve a [Stripe Dashboard > Payment Links](https://dashboard.stripe.com/payment-links)
2. Crea un Payment Link para cada servicio
3. Pega la URL en el campo correspondiente

### 3. WhatsApp
En `js/main.js`, cambia `WHATSAPP_NUMBER` por tu número con código de país (sin +).

### 4. Email de contacto
En `index.html`, busca `contacto@empirica.mx` y reemplázalo con tu email real.

## Deploy en GitHub Pages

1. Ve a Settings > Pages en tu repositorio de GitHub
2. Source: "Deploy from a branch"
3. Branch: `main` (o la rama que uses), carpeta: `/ (root)`
4. Guarda

### Dominio personalizado (empirica.mx)
1. En tu proveedor de DNS, agrega estos registros:
   - `A` record → `185.199.108.153`
   - `A` record → `185.199.109.153`
   - `A` record → `185.199.110.153`
   - `A` record → `185.199.111.153`
   - `CNAME` record: `www` → `Jorch01.github.io`
2. El archivo `CNAME` ya está configurado en el repositorio
3. En GitHub Pages settings, activa "Enforce HTTPS"

## Tecnologías
- HTML5 semántico
- CSS3 moderno (Grid, Flexbox, Custom Properties, Animaciones)
- JavaScript vanilla (sin frameworks)
- Google Fonts (Playfair Display + Inter)
- Font Awesome 6 (iconos)
- Integración con Stripe Payment Links

## Verificador de viabilidad de marca

`landing-registro-marcas-cancun.html` incluye un verificador que usa el Worker de Cloudflare del proyecto
`TSJ_Filing_online` (reglas: Turnstile, 1 estudio al mes por IP, CORS limitado y caché corta).
Cómo activarlo y desplegarlo: `docs/proxy/LEEME-verificador-sitio.md` en ese repositorio.
Mientras `turnstileSiteKey` esté vacía en `js/verificador-config.js`, el verificador avisa que no está disponible y manda a WhatsApp.

`js/verificador-marca-motor.js` se regenera desde la app con
`node herramientas/generar-verificador-sitio.js <ruta>/js/verificador-marca-motor.js` (en `TSJ_Filing_online`).
