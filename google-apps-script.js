/**
 * EMPÍRICA LEGAL LAB — Google Apps Script para Newsletter
 *
 * INSTRUCCIONES:
 * 1. Crea una nueva Google Sheet (https://sheets.google.com)
 * 2. Nombra la primera hoja "Suscriptores"
 * 3. En la fila 1, pon estos encabezados: Nombre | Email | Fuente | Fecha
 * 4. Ve a Extensiones > Apps Script
 * 5. Borra todo el código que aparece y pega ESTE archivo completo
 * 6. Click en "Guardar" (ícono de disco)
 * 7. Click en "Implementar" > "Nueva implementación"
 * 8. Tipo: "Aplicación web"
 * 9. Ejecutar como: "Yo" (tu cuenta)
 * 10. Quién tiene acceso: "Cualquier persona"
 * 11. Click en "Implementar"
 * 12. Copia la URL que te da
 * 13. Pega esa URL en js/main.js en la variable GOOGLE_SHEET_URL
 *
 * ¡Listo! Cada suscriptor se guardará automáticamente en tu Google Sheet.
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Suscriptores');
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    }

    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.name || '',
      data.email || '',
      data.source || 'web',
      data.timestamp || new Date().toISOString()
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Empírica Newsletter API activa' }))
    .setMimeType(ContentService.MimeType.JSON);
}
