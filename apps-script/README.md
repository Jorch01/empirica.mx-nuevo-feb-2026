# Apps Script con despliegue automático

Cada carpeta es un proyecto de Google Apps Script:

| Carpeta | Para qué sirve | Hoja de Google |
|---|---|---|
| `reviews/` | Reseñas de Google para el sitio | La que tiene la pestaña "Reviews" |
| `newsletter/` | Guarda los suscriptores del newsletter | La que tiene la pestaña "Suscriptores" |

Cuando un cambio en `apps-script/` llega a la rama `main`, el workflow
`.github/workflows/deploy-apps-script.yml` sube el código a Apps Script y
actualiza la implementación web que ya existe. **La URL no cambia**, así que no
hay que tocar `js/main.js`. También se puede lanzar a mano desde
GitHub > Actions > "Desplegar Apps Script" > Run workflow.

> No edites el código en el editor de Apps Script: el siguiente despliegue lo
> sobrescribe. Edítalo aquí.

## Configuración única (unos 10 minutos)

Todo se guarda en GitHub > Settings > Secrets and variables > Actions >
**New repository secret**.

### 1. Activar la API de Apps Script
Entra a <https://script.google.com/home/usersettings> con la cuenta dueña de
los scripts y activa **"Google Apps Script API"**.

### 2. Autorizar a GitHub (secret `CLASPRC_JSON`)
No hace falta instalar nada: abre **Google Cloud Shell**
(<https://shell.cloud.google.com>) con la misma cuenta y ejecuta:

```bash
npx @google/clasp@3.4.1 login --no-localhost
```

Abre el enlace que aparece y autoriza. El navegador te llevará a una página
`localhost:8888` que no carga: es normal. **Copia la URL completa de esa
página** (desde la barra de direcciones) y pégala en Cloud Shell. Luego:

```bash
base64 -w0 ~/.clasprc.json; echo
```

Sale una sola línea larga de letras y números. Cópiala completa (sin el
texto del prompt que aparece después) y guárdala como el secret
**`CLASPRC_JSON`**. Es una credencial de tu cuenta: no la compartas por chat ni
correo.

### 3. Datos de cada proyecto
Abre el Apps Script desde la hoja (Extensiones > Apps Script):

- **ID del script**: ⚙️ Configuración del proyecto > IDs > ID de secuencia de comandos.
- **ID de implementación**: Implementar > Administrar implementaciones > la
  implementación activa > "ID de implementación" (empieza con `AKfycb…` y es la
  parte de la URL entre `/s/` y `/exec`).

| Secret | Valor |
|---|---|
| `APPS_SCRIPT_REVIEWS_ID` | ID del script de reseñas |
| `APPS_SCRIPT_REVIEWS_DEPLOYMENT_ID` | `AKfycbwNC-E8ZdUxDJu3tQHbz0FQz3ZvZoFqxIZSa9dSL8zNsDCmMx1_VYFQbUjMLl9XFQCbcg` (la de `js/main.js`) |
| `APPS_SCRIPT_NEWSLETTER_ID` | ID del script del newsletter (opcional) |
| `APPS_SCRIPT_NEWSLETTER_DEPLOYMENT_ID` | ID de implementación del newsletter (opcional) |

### 4. Credenciales de Google Places (solo reseñas)
Cópialas del script de reseñas que tienes hoy (las variables `GOOGLE_API_KEY`
y `PLACE_ID` al inicio del código) **antes** del primer despliegue, porque el
despliegue reemplaza ese código:

| Secret | Valor |
|---|---|
| `GOOGLE_PLACES_API_KEY` | Tu API Key de Google Cloud |
| `GOOGLE_PLACE_ID` | El Place ID de Empírica (empieza con `ChIJ…`) |

### 5. Primer despliegue
GitHub > Actions > "Desplegar Apps Script" > **Run workflow**. Si sale en
verde, abre la URL de la web app: debe responder con las reseñas actuales.

Cada despliegue crea una versión nueva del script. Apps Script guarda hasta
200; si algún día el despliegue falla por eso, borra versiones viejas en el
editor (Implementar > Administrar versiones).

Si algún día cambian los permisos que usa un script (por ejemplo, si se le
agrega Gmail), Google pedirá autorizarlo una vez desde el editor de Apps Script.

## Opcional: refresco automático aunque nadie visite el sitio
En el editor de Apps Script del proyecto de reseñas, elige la función
`setupTrigger` y dale **Ejecutar**. Crea un trigger cada 6 horas.
