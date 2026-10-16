/**
 * EMPÍRICA LEGAL LAB — Google Apps Script para Reseñas de Google
 *
 * Este script actúa como proxy para obtener las reseñas de Google Places API
 * y servirlas a tu sitio web.
 *
 * Cómo se mantiene al día:
 * - Cada visita al sitio pide las reseñas a este script. Si la última consulta
 *   a Google tiene más de CACHE_MINUTES minutos, se vuelve a consultar en ese
 *   momento; si no, se responde desde la caché (rápido y sin costo).
 * - Google solo entrega 5 reseñas por consulta. Para tener más, el script pide
 *   las 5 "más relevantes" y las 5 "más recientes", y además va guardando en la
 *   hoja "Reviews" todas las que ha visto. Así el historial crece con el tiempo.
 * - Si Google falla, se responde con lo último guardado en la hoja.
 *
 * INSTRUCCIONES:
 * 1. Obtén una API Key de Google Cloud con Google Places API habilitada
 *    - Ve a https://console.cloud.google.com
 *    - Crea un proyecto o selecciona uno existente
 *    - Habilita "Places API"
 *    - Crea una API Key en "Credentials"
 *
 * 2. Obtén tu Place ID de Google:
 *    - Ve a https://developers.google.com/maps/documentation/places/web-service/place-id
 *    - Busca "Empírica Legal Lab" y copia el Place ID
 *
 * 3. Crea una nueva Google Sheet
 *    - Nombra la primera hoja "Reviews"
 *
 * 4. Ve a Extensiones > Apps Script
 *    - Pega ESTE archivo completo
 *    - Reemplaza GOOGLE_API_KEY y PLACE_ID con tus valores
 *
 * 5. Haz deploy como Web App (acceso: Anyone)
 *    - Copia la URL y pégala en js/main.js en GOOGLE_REVIEWS_URL
 *    - Si ya tenías el script publicado: "Implementar > Administrar
 *      implementaciones > editar (lápiz) > Versión: Nueva versión". Así la URL
 *      no cambia y no hay que tocar js/main.js.
 *
 * 6. (Opcional) Trigger para que la hoja se actualice aunque nadie visite el sitio:
 *    - En Apps Script, ve a "Triggers" (ícono de reloj)
 *    - Agrega un trigger para "fetchAndCacheReviews"
 *    - Tipo: "Time-driven", "Hour timer", "Every 6 hours"
 */

var GOOGLE_API_KEY = 'REPLACE_WITH_YOUR_GOOGLE_API_KEY';
var PLACE_ID = 'REPLACE_WITH_YOUR_PLACE_ID';

/* Minutos que una consulta a Google se reutiliza antes de volver a pedirla.
   Cada actualización hace 2 consultas a Places API; súbelo si quieres gastar menos. */
var CACHE_MINUTES = 60;
var CACHE_KEY = 'reviews_v2';
var MAX_STORED_REVIEWS = 200;

function doGet(e) {
  try {
    var force = e && e.parameter && e.parameter.refresh === '1';
    var cache = CacheService.getScriptCache();
    var cached = force ? null : cache.get(CACHE_KEY);
    var result = cached ? JSON.parse(cached) : fetchAndCacheReviews();

    if (!result) result = readStored();
    if (!result) result = { reviews: [], rating: 0, total: 0 };

    return jsonOut(result);

  } catch (error) {
    var stored = readStored();
    return jsonOut(stored || { error: error.toString(), reviews: [], rating: 0, total: 0 });
  }
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName('Reviews') || ss.insertSheet('Reviews');
}

function readStored() {
  var data = getSheet().getRange('A1').getValue();
  return data ? JSON.parse(data) : null;
}

function fetchPlace(sort) {
  var url = 'https://maps.googleapis.com/maps/api/place/details/json'
    + '?place_id=' + encodeURIComponent(PLACE_ID)
    + '&fields=name,rating,user_ratings_total,reviews,url'
    + '&language=es'
    + '&reviews_no_translations=false'
    + '&reviews_sort=' + sort
    + '&key=' + GOOGLE_API_KEY;

  var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  var json = JSON.parse(response.getContentText());

  if (json.status !== 'OK' || !json.result) {
    Logger.log('Google Places API error (' + sort + '): ' + json.status);
    return null;
  }
  return json.result;
}

function reviewKey(r) {
  return (r.author || '') + '|' + (r.time || '');
}

function fetchAndCacheReviews() {
  if (GOOGLE_API_KEY === 'REPLACE_WITH_YOUR_GOOGLE_API_KEY' || PLACE_ID === 'REPLACE_WITH_YOUR_PLACE_ID') {
    Logger.log('Please configure GOOGLE_API_KEY and PLACE_ID');
    return null;
  }

  var relevant = fetchPlace('most_relevant');
  var newest = fetchPlace('newest');
  var place = newest || relevant;
  if (!place) return null;

  // Historial: lo guardado + lo que Google devuelve hoy (lo nuevo reemplaza a lo viejo)
  var stored = readStored();
  var byKey = {};
  ((stored && stored.reviews) || []).forEach(function (r) { byKey[reviewKey(r)] = r; });

  [relevant, newest].forEach(function (p) {
    if (!p) return;
    (p.reviews || []).forEach(function (r) {
      var review = {
        author: r.author_name,
        authorUrl: r.author_url || '',
        photo: r.profile_photo_url || '',
        rating: r.rating,
        text: r.text || '',
        date: r.relative_time_description,
        time: r.time
      };
      byKey[reviewKey(review)] = review;
    });
  });

  var reviews = Object.keys(byKey).map(function (k) { return byKey[k]; });
  reviews.sort(function (a, b) { return (b.time || 0) - (a.time || 0); });
  reviews = reviews.slice(0, MAX_STORED_REVIEWS);

  var cacheData = {
    rating: place.rating || 0,
    total: place.user_ratings_total || 0,
    url: place.url || '',
    placeId: PLACE_ID,
    reviews: reviews,
    lastUpdated: new Date().toISOString()
  };

  var json = JSON.stringify(cacheData);
  getSheet().getRange('A1').setValue(json);
  try {
    CacheService.getScriptCache().put(CACHE_KEY, json, CACHE_MINUTES * 60);
  } catch (err) {
    // La caché acepta hasta 100 KB; si se pasa, se sigue sirviendo desde la hoja
    Logger.log('Cache put failed: ' + err);
  }

  Logger.log('Reviews cached successfully: ' + reviews.length + ' reviews');
  return cacheData;
}
