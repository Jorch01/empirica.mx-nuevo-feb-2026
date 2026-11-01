#!/usr/bin/env node
/**
 * Despliega cada proyecto de apps-script/ y publica la URL de su web app en
 * js/apps-script-urls.js, que es de donde la toma el sitio. Lo corre
 * .github/workflows/deploy-apps-script.yml; la configuración única está en
 * apps-script/README.md.
 *
 * Para cada carpeta apps-script/<proyecto>/ que tenga appsscript.json:
 *   - El secret APPS_SCRIPT_<PROYECTO>_ID dice a qué script de Google se sube.
 *     Sin él, el proyecto se omite sin fallar.
 *   - La web app que se actualiza es la del secret
 *     APPS_SCRIPT_<PROYECTO>_DEPLOYMENT_ID o, si no hay, la que ya está
 *     publicada en js/apps-script-urls.js. Si no hay ninguna, se crea una y su
 *     URL queda publicada: no hay que copiarla a mano.
 *   - Al final se le hace una petición a la web app: si no responde, falta
 *     autorizar el script una vez desde su editor.
 *
 * Entorno: SECRETOS (toJSON(secrets) del workflow) y ~/.clasprc.json listo.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const URLS = path.join('js', 'apps-script-urls.js');

// Marcas en el código que se reemplazan al desplegar con el secret indicado:
// así las credenciales no viven en el repositorio público.
const SUSTITUCIONES = { __GOOGLE_API_KEY__: 'GOOGLE_PLACES_API_KEY', __PLACE_ID__: 'GOOGLE_PLACE_ID' };

/** { proyecto: url } de lo que ya está publicado en js/apps-script-urls.js. */
export function leerUrls(texto) {
    const i = texto.indexOf('{'), j = texto.lastIndexOf('}');
    if (i < 0 || j < i) return {};
    try { return JSON.parse(texto.slice(i, j + 1)); } catch (e) { return {}; }
}

export function escribirUrls(urls) {
    const ordenadas = Object.fromEntries(Object.keys(urls).sort().map(k => [k, urls[k]]));
    return '/* Lo genera .github/workflows/deploy-apps-script.yml al desplegar: no lo edites a mano.\n' +
        '   La URL de la web app de cada proyecto de apps-script/. */\n' +
        'window.EMPIRICA_APPS_SCRIPT = ' + JSON.stringify(ordenadas, null, 4) + ';\n';
}

export const idDeUrl = url => (/\/macros\/s\/([A-Za-z0-9_-]+)\/exec/.exec(url || '') || [])[1] || '';
export const urlDeId = id => 'https://script.google.com/macros/s/' + id + '/exec';
export const claveSecreto = proyecto => proyecto.toUpperCase().replace(/[^A-Z0-9]/g, '_');

function anotar(tipo, texto) { console.log('::' + tipo + '::' + texto); }

function clasp(args, cwd) {
    return execFileSync('clasp', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

/** ¿La web app ya contesta? Si el script no está autorizado, Google responde con una página de error. */
async function responde(url) {
    try {
        const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(30000) });
        JSON.parse(await r.text());
        return true;
    } catch (e) {
        return false;
    }
}

async function desplegar(proyecto, secretos, publicadas) {
    const clave = claveSecreto(proyecto);
    const scriptId = secretos['APPS_SCRIPT_' + clave + '_ID'];
    if (!scriptId) {
        anotar('notice', proyecto + ': falta el secret APPS_SCRIPT_' + clave + '_ID; se omite.');
        return null;
    }
    // Se sube una copia: las credenciales inyectadas nunca tocan el repositorio.
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'apps-script-' + proyecto + '-'));
    try {
        fs.cpSync(path.join('apps-script', proyecto), dir, { recursive: true });
        for (const archivo of fs.readdirSync(dir).filter(f => /\.(js|gs|html)$/.test(f))) {
            let texto = fs.readFileSync(path.join(dir, archivo), 'utf8');
            for (const [marca, nombre] of Object.entries(SUSTITUCIONES)) {
                if (secretos[nombre]) texto = texto.split(marca).join(secretos[nombre]);
            }
            fs.writeFileSync(path.join(dir, archivo), texto);
        }
        fs.writeFileSync(path.join(dir, '.clasp.json'), JSON.stringify({ scriptId, rootDir: '.' }));

        clasp(['push', '--force'], dir);
        const descripcion = 'GitHub ' + (process.env.GITHUB_SHA || 'local').slice(0, 7);
        let id = secretos['APPS_SCRIPT_' + clave + '_DEPLOYMENT_ID'] || idDeUrl(publicadas[proyecto]);
        if (id) {
            clasp(['redeploy', id, '--description', descripcion], dir);
        } else {
            const salida = clasp(['--json', 'create-deployment', '--description', descripcion], dir);
            id = JSON.parse(salida.slice(salida.indexOf('{'), salida.lastIndexOf('}') + 1)).deploymentId;
            if (!id) throw new Error('clasp no devolvió el id de la web app nueva');
            anotar('notice', proyecto + ': se creó su web app ' + urlDeId(id));
        }
        const url = urlDeId(id);
        if (await responde(url)) console.log('✓ ' + proyecto + ': ' + url);
        else anotar('warning', proyecto + ': la web app todavía no responde. Si es nueva o pide permisos nuevos, ' +
            'abre su editor de Apps Script, elige la función autorizar y dale Ejecutar una sola vez.');
        return url;
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

async function main() {
    const secretos = JSON.parse(process.env.SECRETOS || '{}');
    const antes = fs.existsSync(URLS) ? fs.readFileSync(URLS, 'utf8') : '';
    const publicadas = leerUrls(antes);
    const urls = { ...publicadas };
    let fallos = 0;
    const proyectos = fs.readdirSync('apps-script', { withFileTypes: true })
        .filter(d => d.isDirectory() && fs.existsSync(path.join('apps-script', d.name, 'appsscript.json')))
        .map(d => d.name).sort();
    for (const proyecto of proyectos) {
        try {
            const url = await desplegar(proyecto, secretos, publicadas);
            if (url) urls[proyecto] = url;
        } catch (e) {
            fallos++;
            const detalle = String((e.stderr && e.stderr.toString()) || e.message || e).trim().split('\n').filter(Boolean).pop();
            anotar('error', proyecto + ': ' + detalle);
        }
    }
    const despues = escribirUrls(urls);
    if (despues !== antes) {
        fs.writeFileSync(URLS, despues);
        console.log('Se actualizó ' + URLS);
    }
    process.exitCode = fallos ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
