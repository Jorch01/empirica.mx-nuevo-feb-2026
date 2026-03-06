/**
 * EMPÍRICA LEGAL LAB — Google Apps Script para Reseñas de Google
 *
 * Este script actúa como proxy para obtener las reseñas de Google Places API
 * y servirlas a tu sitio web. Las reseñas se cachean en una Google Sheet
 * y se actualizan diariamente mediante un trigger automático.
 *
 * INSTRUCCIONES:
 * 1. Obtén una API Key de Google Cloud con Google Places API habilitada
 *    - Ve a https://console.cloud.google.com
 *    - Crea un proyecto o selecciona uno existente
 *    - Habilita "Places API" y "Places API (New)"
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
 *
 * 6. Configura un trigger diario:
 *    - En Apps Script, ve a "Triggers" (ícono de reloj)
 *    - Agrega un trigger para "fetchAndCacheReviews"
 *    - Tipo: "Time-driven", "Day timer", "6am to 7am"
 */

var GOOGLE_API_KEY = 'REPLACE_WITH_YOUR_GOOGLE_API_KEY';
var PLACE_ID = 'REPLACE_WITH_YOUR_PLACE_ID';

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reviews');
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Sheet "Reviews" not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet.getRange('A1').getValue();
    if (!data) {
      fetchAndCacheReviews();
      data = sheet.getRange('A1').getValue();
    }

    var result = data ? JSON.parse(data) : { reviews: [], rating: 0, total: 0 };

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function fetchAndCacheReviews() {
  if (GOOGLE_API_KEY === 'REPLACE_WITH_YOUR_GOOGLE_API_KEY' || PLACE_ID === 'REPLACE_WITH_YOUR_PLACE_ID') {
    Logger.log('Please configure GOOGLE_API_KEY and PLACE_ID');
    return;
  }

  var url = 'https://maps.googleapis.com/maps/api/place/details/json'
    + '?place_id=' + PLACE_ID
    + '&fields=name,rating,user_ratings_total,reviews'
    + '&language=es'
    + '&key=' + GOOGLE_API_KEY;

  var response = UrlFetchApp.fetch(url);
  var json = JSON.parse(response.getContentText());

  if (json.status !== 'OK' || !json.result) {
    Logger.log('Google Places API error: ' + json.status);
    return;
  }

  var place = json.result;
  var reviews = (place.reviews || []).map(function (r) {
    return {
      author: r.author_name,
      rating: r.rating,
      text: r.text,
      date: r.relative_time_description,
      time: r.time
    };
  });

  var cacheData = {
    rating: place.rating || 0,
    total: place.user_ratings_total || 0,
    reviews: reviews,
    lastUpdated: new Date().toISOString()
  };

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reviews');
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Reviews');
  }
  sheet.getRange('A1').setValue(JSON.stringify(cacheData));

  Logger.log('Reviews cached successfully: ' + reviews.length + ' reviews');
}
