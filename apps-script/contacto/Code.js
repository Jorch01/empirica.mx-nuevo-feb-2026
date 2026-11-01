/**
 * EMPÍRICA LEGAL LAB — Contactos del sitio
 *
 * Recibe el formulario rápido de las landings: guarda cada mensaje en la
 * pestaña "Contactos" de la hoja (la crea si no existe) y avisa por correo a
 * AVISAR_A, con el correo del cliente como "Responder a".
 *
 * DESPLIEGUE AUTOMÁTICO: este archivo se sube solo desde GitHub y la URL de la
 * web app se publica sola en js/apps-script-urls.js (ver apps-script/README.md).
 * No lo edites en el editor de Apps Script: el siguiente despliegue lo
 * sobrescribe.
 *
 * Una sola vez, después del primer despliegue: en el editor, elige la función
 * autorizar y dale Ejecutar para conceder los permisos de la hoja y del correo.
 */

/* A quién le llega el aviso de cada contacto. */
var AVISAR_A = ['frida@empirica.mx', 'jorge_clemente@empirica.mx'];

var HOJA = 'Contactos';
var COLUMNAS = ['Fecha', 'Nombre', 'Correo', 'WhatsApp / teléfono', 'Perfil', 'Qué pasó', 'Página', 'Idioma', 'Campaña', 'Llegó desde'];

/* Tope de mensajes por hora: frena a un robot antes de que gaste la cuota de correo. */
var MAX_POR_HORA = 30;

var LIMITES = { nombre: 120, correo: 160, telefono: 40, perfil: 40, mensaje: 3000, pagina: 200, idioma: 5, campana: 300, referente: 300 };

function doPost(e) {
  try {
    var datos = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    // El campo oculto solo lo llena un robot: se le contesta "ok" y no se guarda.
    if (datos.sitio_web) return responder({ status: 'ok' });

    var c = limpiar(datos);
    if (!c.nombre || !c.mensaje || (!c.correo && !c.telefono)) {
      return responder({ status: 'error', message: 'faltan datos' });
    }
    if (c.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.correo)) {
      return responder({ status: 'error', message: 'correo no válido' });
    }
    if (!dentroDelTope()) return responder({ status: 'error', message: 'demasiados mensajes; intenta más tarde' });

    var candado = LockService.getScriptLock();
    candado.waitLock(10000);
    try {
      hoja().appendRow([new Date(), c.nombre, c.correo, c.telefono, c.perfil, c.mensaje, c.pagina, c.idioma, c.campana, c.referente]
        .map(sinFormula));
    } finally {
      candado.releaseLock();
    }
    avisar(c);
    return responder({ status: 'ok' });
  } catch (error) {
    console.error(error);
    return responder({ status: 'error', message: 'no se pudo guardar' });
  }
}

/* Responde si ya está autorizada: el despliegue lo usa para saber si falta ese paso. */
function doGet() {
  hoja();
  MailApp.getRemainingDailyQuota();
  return responder({ status: 'ok', servicio: 'contacto' });
}

/* Ejecútala una vez desde el editor para conceder los permisos. */
function autorizar() {
  hoja();
  console.log('Listo. Correos que quedan hoy: ' + MailApp.getRemainingDailyQuota());
}

function limpiar(d) {
  var c = {};
  Object.keys(LIMITES).forEach(function (k) {
    c[k] = String(d[k] == null ? '' : d[k]).replace(/\s+$/, '').replace(/^\s+/, '').slice(0, LIMITES[k]);
  });
  c.correo = c.correo.toLowerCase();
  return c;
}

/* Lo que empieza con = + - @ la hoja lo tomaría como fórmula. */
function sinFormula(v) {
  return typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : v;
}

function dentroDelTope() {
  var cache = CacheService.getScriptCache();
  var clave = 'contactos_' + Utilities.formatDate(new Date(), 'GMT', 'yyyyMMddHH');
  var n = Number(cache.get(clave) || 0);
  if (n >= MAX_POR_HORA) return false;
  cache.put(clave, String(n + 1), 3600);
  return true;
}

function hoja() {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var h = libro.getSheetByName(HOJA);
  if (!h) {
    h = libro.insertSheet(HOJA);
    h.appendRow(COLUMNAS);
    h.setFrozenRows(1);
    h.getRange(1, 1, 1, COLUMNAS.length).setFontWeight('bold');
  }
  return h;
}

function avisar(c) {
  var digitos = c.telefono.replace(/\D/g, '');
  var cuerpo = [
    'Nuevo contacto desde el sitio.',
    '',
    'Nombre: ' + c.nombre,
    'Correo: ' + (c.correo || '—'),
    'WhatsApp / teléfono: ' + (c.telefono || '—') + (digitos.length >= 10 ? '  →  https://wa.me/' + digitos : ''),
    'Perfil: ' + (c.perfil || '—'),
    'Página: ' + (c.pagina || '—') + (c.idioma ? ' (' + c.idioma + ')' : ''),
    c.campana ? 'Campaña: ' + c.campana : '',
    c.referente ? 'Llegó desde: ' + c.referente : '',
    '',
    'Qué pasó:',
    c.mensaje,
    '',
    'Queda guardado en la hoja "' + HOJA + '": ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  ].filter(function (linea, i, todas) { return linea !== '' || todas[i - 1] !== ''; }).join('\n');
  var aviso = { to: AVISAR_A.join(','), subject: 'Nuevo contacto web: ' + c.nombre + (c.pagina ? ' · ' + c.pagina : ''), body: cuerpo, name: 'Sitio Empírica' };
  if (c.correo) aviso.replyTo = c.correo;
  MailApp.sendEmail(aviso);
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
