# Apps Script con despliegue automático

Cada carpeta es un proyecto de Google Apps Script:

| Carpeta | Para qué sirve | Hoja de Google |
|---|---|---|
| `reviews/` | Reseñas de Google para el sitio | La que tiene la pestaña "Reviews" |
| `newsletter/` | Guarda los suscriptores del newsletter | La que tiene la pestaña "Suscriptores" |
| `contacto/` | Formulario rápido de las landings: guarda cada mensaje y avisa por correo | La que tendrá la pestaña "Contactos" (el script la crea) |

Cuando un cambio en `apps-script/` llega a la rama `main`, el workflow
`.github/workflows/deploy-apps-script.yml` sube el código de **cada carpeta** a
su Apps Script y actualiza su implementación web. **La URL no cambia.** Si un
proyecto todavía no tiene implementación web, el workflow la crea y publica su
URL en `js/apps-script-urls.js`, que es de donde la toma el sitio: no hay que
copiar URLs a mano. También se puede lanzar desde
GitHub > Actions > "Desplegar Apps Script" > Run workflow.

Un proyecto nuevo solo necesita su carpeta (con `appsscript.json` y su código)
y el secret `APPS_SCRIPT_<CARPETA>_ID`, con el nombre de la carpeta en
mayúsculas (`contacto` → `APPS_SCRIPT_CONTACTO_ID`). El workflow no se toca.

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

Los `…_DEPLOYMENT_ID` son opcionales: sin ellos, el workflow usa la web app ya
publicada en `js/apps-script-urls.js` o crea una.

### 4. Credenciales de Google Places (solo reseñas)
Cópialas del script de reseñas que tienes hoy (las variables `GOOGLE_API_KEY`
y `PLACE_ID` al inicio del código) **antes** del primer despliegue, porque el
despliegue reemplaza ese código:

| Secret | Valor |
|---|---|
| `GOOGLE_PLACES_API_KEY` | Tu API Key de Google Cloud |
| `GOOGLE_PLACE_ID` | El Place ID de Empírica (empieza con `ChIJ…`) |

### 5. Formulario de contacto (`contacto/`)
1. Crea una hoja de Google nueva (por ejemplo, "Contactos del sitio").
2. En la hoja: Extensiones > Apps Script. No pegues nada: deja el proyecto vacío.
3. ⚙️ Configuración del proyecto > IDs > copia el **ID de secuencia de comandos**
   y guárdalo como el secret **`APPS_SCRIPT_CONTACTO_ID`**.
4. GitHub > Actions > "Desplegar Apps Script" > **Run workflow**. Sube el código,
   crea la web app y publica su URL en el sitio (un commit de
   `github-actions[bot]` en `main`).
5. Vuelve al editor de Apps Script (recarga la página), elige la función
   **`autorizar`** y dale **Ejecutar**. Acepta los permisos de la hoja y del
   correo. Solo esta vez: los despliegues siguientes ya no lo piden.

Desde ese momento, cada mensaje del formulario queda en la pestaña "Contactos" y
llega un aviso a los correos de `AVISAR_A` (al inicio de `contacto/Code.js`).
Mientras no esté configurado, el formulario abre WhatsApp con el mensaje, así
que ningún cliente se pierde.

Si el registro del workflow dice que una web app "todavía no responde", es que
falta el paso 5 en ese proyecto.

### 6. Primer despliegue
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
