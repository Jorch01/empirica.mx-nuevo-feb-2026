# Empírica Legal Lab — Sitio Web

Sitio web moderno para **Empírica Legal Lab** — despacho jurídico enfocado en emprendedores.

## Estructura

```
├── index.html                    # Página principal
├── css/styles.css                # Estilos (responsive, animaciones)
├── js/main.js                    # JavaScript (modales, Stripe, formularios)
├── assets/images/
│   ├── logo/                     # Coloca tu logo aquí
│   ├── services/                 # Imágenes de servicios (opcional)
│   └── hero/                     # Foto para "Sobre Nosotros"
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
