/**
 * Verificador de viabilidad de marca — widget de la landing de marcas.
 *
 * Formulario (denominación, tipo, hasta 3 clases de Niza, giro) → estudio →
 * resultado público (semáforo orientativo + resumen + número de antecedentes) →
 * dictamen detallado, que se desbloquea con nombre, correo y WhatsApp.
 *
 * El estudio lo hace js/verificador-marca-motor.js (generado desde la app), que
 * se carga solo cuando alguien lo pide. El Worker pone las reglas: Turnstile,
 * 1 estudio al mes por IP y CORS. Ver docs/proxy/LEEME-verificador-sitio.md en
 * el repositorio TSJ_Filing_online.
 */
(function () {
    'use strict';

    var CFG = Object.assign({
        turnstileSiteKey: '', proxy: 'https://throbbing-scene-1c2b.enlilh.workers.dev', whatsapp: '529982570828',
        motor: 'js/verificador-marca-motor.js', maxClases: 3
    }, window.VERIFICADOR_MARCA_CONFIG || {});

    var CLAVE_ULTIMO = 'verificador_marca_ultimo';
    var AVISO = 'Los resultados son orientativos: dependen de consultas a sistemas externos del Instituto Mexicano de la Propiedad Industrial (IMPI), ' +
        'que pueden estar incompletos, desactualizados o fallar. No son concluyentes ni constituyen un dictamen legal, y este sitio no está afiliado al IMPI. ' +
        'Antes de presentar una solicitud, consulta a un especialista en propiedad industrial: con gusto te asesoramos.';

    // Clases de Niza, con una descripción en lenguaje claro (1–34 productos, 35–45 servicios).
    var NIZA = {
        1: 'Productos químicos para la industria, la ciencia y la agricultura', 2: 'Pinturas, barnices y colorantes',
        3: 'Cosméticos, perfumería y productos de limpieza', 4: 'Aceites y grasas industriales, combustibles y velas',
        5: 'Farmacéuticos, productos veterinarios y suplementos alimenticios', 6: 'Metales comunes y artículos de metal',
        7: 'Máquinas y máquinas herramienta', 8: 'Herramientas de mano y cubiertos',
        9: 'Aparatos científicos y electrónicos, software y aplicaciones', 10: 'Aparatos e instrumentos médicos',
        11: 'Alumbrado, calefacción, refrigeración y cocción', 12: 'Vehículos y aparatos de locomoción',
        13: 'Armas de fuego, municiones y pirotecnia', 14: 'Joyería, bisutería y relojería', 15: 'Instrumentos musicales',
        16: 'Papel, cartón, papelería y artículos de oficina', 17: 'Caucho, plástico y materiales aislantes',
        18: 'Cuero, bolsos, maletas y paraguas', 19: 'Materiales de construcción no metálicos', 20: 'Muebles, espejos y marcos',
        21: 'Utensilios y recipientes para el hogar y la cocina', 22: 'Cuerdas, redes, tiendas de campaña y toldos',
        23: 'Hilos para uso textil', 24: 'Tejidos y ropa de cama o de mesa', 25: 'Ropa, calzado y artículos de sombrerería',
        26: 'Encajes, bordados, cintas y botones', 27: 'Alfombras, tapetes y revestimientos de suelos',
        28: 'Juegos, juguetes y artículos de deporte', 29: 'Carne, pescado, lácteos, conservas y alimentos procesados',
        30: 'Café, té, cacao, pan, pastelería y condimentos', 31: 'Productos agrícolas, frutas y verduras frescas, animales vivos',
        32: 'Cervezas y bebidas sin alcohol', 33: 'Bebidas alcohólicas (excepto cervezas)', 34: 'Tabaco y artículos para fumadores',
        35: 'Publicidad, gestión de negocios y comercio minorista', 36: 'Servicios financieros, seguros e inmobiliarios',
        37: 'Construcción, instalación y reparación', 38: 'Telecomunicaciones', 39: 'Transporte, embalaje y organización de viajes',
        40: 'Tratamiento de materiales', 41: 'Educación, formación y entretenimiento',
        42: 'Servicios científicos y tecnológicos, diseño y desarrollo de software',
        43: 'Restaurantes, bares, cafeterías y hospedaje temporal', 44: 'Servicios médicos, de belleza y de agricultura',
        45: 'Servicios jurídicos y de seguridad, servicios personales y sociales'
    };

    var raiz = document.getElementById('verificador-marca');
    if (!raiz) return;

    var estado = { clases: [], turnstile: null, token: '', pase: null, sesion: null, ejecutando: false, entrada: null, reporte: null, crudo: null, leadEnviado: false };
    var CLIENTE = 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);

    // ------------------------------------------------------------------ utilidades
    function esc(t) {
        return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
    }
    function $(id) { return document.getElementById(id); }
    function guardar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* modo privado */ } }
    function leer(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
    function plural(n, uno, varios) { return n === 1 ? uno : varios; }
    function num(n) { try { return Number(n).toLocaleString('es-MX'); } catch (e) { return String(n); } }
    // "16 de riesgo alto y 997 de riesgo medio" (solo lo que haya)
    function desgloseRiesgo(r) {
        var partes = [];
        if (r.alto) partes.push(num(r.alto) + ' de riesgo alto');
        if (r.medio) partes.push(num(r.medio) + ' de riesgo medio');
        return partes.join(' y ');
    }

    // Eventos de Google Analytics 4 (el sitio ya carga gtag y GTM). Sin datos personales ni la denominación.
    function medir(evento, params) {
        try {
            if (typeof window.gtag === 'function') window.gtag('event', evento, params || {});
            else if (window.dataLayer) window.dataLayer.push(Object.assign({ event: evento }, params || {}));
        } catch (e) { /* medir nunca rompe el verificador */ }
    }

    function whatsapp(texto) { return 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(texto); }

    // ------------------------------------------------------------------ formulario
    function opcionesClases() {
        function grupo(titulo, desde, hasta) {
            var o = '<optgroup label="' + titulo + '">';
            for (var n = desde; n <= hasta; n++) o += '<option value="' + n + '">' + n + ' — ' + esc(NIZA[n]) + '</option>';
            return o + '</optgroup>';
        }
        return '<option value="">Agregar una clase…</option>' + grupo('Productos (clases 1 a 34)', 1, 34) + grupo('Servicios (clases 35 a 45)', 35, 45);
    }

    function pintarFormulario(mensaje) {
        var ultimo = leer(CLAVE_ULTIMO);
        // El contenedor del widget de Turnstile se reconstruye: el anterior se quita (si sigue ahí) y se empieza de cero.
        quitarTurnstile();
        raiz.innerHTML =
            '<div class="vm">' +
            '<form class="vm-card" id="vm-form" novalidate>' +
                '<div id="vm-mensaje" role="alert">' + (mensaje || '') + '</div>' +
                '<div class="vm-fila">' +
                    '<div class="vm-campo"><label for="vm-denominacion">Denominación de la marca <span class="vm-req">*</span></label>' +
                        '<input type="text" id="vm-denominacion" maxlength="120" autocomplete="off" placeholder="Ej: Luna Azul" required></div>' +
                    '<div class="vm-campo"><label for="vm-tipo">Tipo de marca</label><select id="vm-tipo">' +
                        '<option value="nominativa">Solo palabras (nominativa)</option><option value="mixta">Palabras y diseño (mixta)</option>' +
                        '<option value="figurativa">Solo diseño (figurativa)</option><option value="tridimensional">Forma tridimensional</option></select></div>' +
                '</div>' +
                '<div class="vm-campo"><span class="vm-etiqueta" id="vm-et-clases">Clases de Niza <span class="vm-req">*</span> <small>(hasta ' + CFG.maxClases + ')</small></span>' +
                    '<div class="vm-chips" id="vm-chips" aria-live="polite" aria-labelledby="vm-et-clases"></div>' +
                    '<select id="vm-clase" aria-labelledby="vm-et-clases">' + opcionesClases() + '</select>' +
                    '<span class="vm-ayuda">La clase indica para qué productos o servicios se usará la marca. Si dudas cuál elegir, déjanos tu giro abajo o escríbenos.</span></div>' +
                '<div class="vm-campo"><label for="vm-giro">¿A qué se dedica tu negocio? (opcional)</label>' +
                    '<input type="text" id="vm-giro" maxlength="300" autocomplete="off" placeholder="Ej: tienda de ropa de playa en Cancún">' +
                    '<span class="vm-ayuda">Nos ayuda a revisar si el nombre describe lo que ofreces.</span></div>' +
                '<div class="vm-turnstile" id="vm-turnstile"></div>' +
                '<p class="vm-aviso" role="note"><strong>Importante.</strong> ' + esc(AVISO) + '</p>' +
                '<div class="vm-acciones"><button type="submit" class="vm-btn" id="vm-ejecutar">Verificar mi marca</button>' +
                (ultimo ? '<button type="button" class="vm-btn vm-btn-sec" id="vm-ultimo">Ver mi último resultado</button>' : '') + '</div>' +
            '</form>' +
            '</div>';
        $('vm-form').addEventListener('submit', function (e) { e.preventDefault(); ejecutar(); });
        $('vm-clase').addEventListener('change', agregarClase);
        $('vm-chips').addEventListener('click', quitarClase);
        $('vm-form').addEventListener('focusin', prepararTurnstile, { once: true });
        if ($('vm-ultimo')) $('vm-ultimo').addEventListener('click', mostrarUltimo);
        pintarChips();
    }

    function pintarChips() {
        var el = $('vm-chips');
        if (!el) return;
        el.innerHTML = estado.clases.length ? estado.clases.map(function (n) {
            return '<span class="vm-chip">' + n + ' — ' + esc(NIZA[n]) + '<button type="button" data-clase="' + n + '" aria-label="Quitar la clase ' + n + '">✕</button></span>';
        }).join('') : '<span class="vm-sin">Aún no eliges ninguna clase</span>';
    }

    function agregarClase(e) {
        var n = parseInt(e.target.value, 10);
        e.target.value = '';
        if (!n || estado.clases.indexOf(n) >= 0) return;
        if (estado.clases.length >= CFG.maxClases) { avisar('error', 'Puedes revisar hasta ' + CFG.maxClases + ' clases por estudio.'); return; }
        estado.clases.push(n);
        estado.clases.sort(function (a, b) { return a - b; });
        pintarChips();
    }

    function quitarClase(e) {
        var b = e.target.closest ? e.target.closest('button[data-clase]') : null;
        if (!b) return;
        estado.clases = estado.clases.filter(function (n) { return n !== parseInt(b.getAttribute('data-clase'), 10); });
        pintarChips();
    }

    function avisar(tipo, html) {
        var el = $('vm-mensaje');
        if (el) el.innerHTML = html ? '<div class="' + (tipo === 'ok' ? 'vm-ok' : 'vm-error') + '">' + html + '</div>' : '';
    }

    // ------------------------------------------------------------------ Turnstile
    var promesaTurnstile = null;
    function cargarTurnstile() {
        if (promesaTurnstile) return promesaTurnstile;
        promesaTurnstile = new Promise(function (ok, mal) {
            if (window.turnstile) return ok();
            var s = document.createElement('script');
            s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            s.async = true; s.defer = true;
            s.onload = function () { ok(); };
            s.onerror = function () { promesaTurnstile = null; mal(new Error('No se pudo cargar la verificación')); };
            document.head.appendChild(s);
        });
        return promesaTurnstile;
    }

    function prepararTurnstile() {
        if (!CFG.turnstileSiteKey || estado.turnstile !== null) return;
        estado.turnstile = 'pendiente';
        cargarTurnstile().then(function () {
            var cont = $('vm-turnstile');
            if (!cont) { estado.turnstile = null; return; }
            estado.turnstile = window.turnstile.render(cont, {
                sitekey: CFG.turnstileSiteKey, theme: 'dark', language: 'es',
                callback: function (t) { estado.token = t; },
                'expired-callback': function () { estado.token = ''; },
                'error-callback': function () { estado.token = ''; }
            });
        }).catch(function () { estado.turnstile = null; /* se avisa al enviar */ });
    }

    // Quita el widget solo si todavía está en la página; así no hay avisos de "Cannot find Widget" en la consola.
    function quitarTurnstile() {
        var id = estado.turnstile;
        estado.turnstile = null; estado.token = '';
        if (id === null || id === 'pendiente') return;
        try { if (window.turnstile && $('vm-turnstile')) window.turnstile.remove(id); } catch (e) { /* ya no existe */ }
    }

    function reiniciarTurnstile() {
        estado.token = '';
        try { if (window.turnstile && estado.turnstile !== null && estado.turnstile !== 'pendiente') window.turnstile.reset(estado.turnstile); } catch (e) { /* ya no existe */ }
    }

    // ------------------------------------------------------------------ proxy (Worker)
    function decodificarPase(pase) {
        try {
            var b = pase.split('.')[0].replace(/-/g, '+').replace(/_/g, '/');
            while (b.length % 4) b += '=';
            return JSON.parse(decodeURIComponent(escape(atob(b))));
        } catch (e) { return null; }
    }

    function pedirPase() {
        return fetch(CFG.proxy + '/cuota', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ tipo: 'viabilidad_sitio', turnstile: estado.token })
        }).then(function (r) {
            return r.json().catch(function () { return {}; }).then(function (d) { return { status: r.status, datos: d }; });
        });
    }

    function proxyFetch(ruta, opciones) {
        var h = { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-IMPI-Client': CLIENTE };
        if (estado.sesion) h['X-IMPI-Session'] = estado.sesion;
        if (estado.pase) h['X-TSJ-Cuota'] = estado.pase;
        var init = Object.assign({}, opciones);
        init.headers = Object.assign(h, (opciones && opciones.headers) || {});
        return fetch(CFG.proxy + ruta, init).then(function (r) {
            var s = r.headers.get('X-IMPI-Session');
            if (s) estado.sesion = s;
            if (r.status === 402) throw new Error('Límite del plan gratuito alcanzado');
            if (!r.ok) return r.json().catch(function () { return { error: 'HTTP ' + r.status }; }).then(function (d) { throw new Error(d.error || 'HTTP ' + r.status); });
            return r.json();
        });
    }

    var promesaMotor = null;
    function cargarMotor() {
        if (window.VerificadorMarca) return Promise.resolve();
        if (promesaMotor) return promesaMotor;
        promesaMotor = new Promise(function (ok, mal) {
            var s = document.createElement('script');
            s.src = CFG.motor; s.async = true;
            s.onload = function () { ok(); };
            s.onerror = function () { promesaMotor = null; mal(new Error('No se pudo cargar el verificador')); };
            document.head.appendChild(s);
        });
        return promesaMotor;
    }

    // ------------------------------------------------------------------ estudio
    function leerEntrada() {
        return {
            denominacion: ($('vm-denominacion').value || '').trim(), tipo: $('vm-tipo').value, clases: estado.clases.slice(),
            productos: ($('vm-giro').value || '').trim(), solicitante: '', porPalabra: true
        };
    }

    function noDisponible(extra) {
        return 'El verificador no está disponible en este momento. ' + (extra || '') +
            ' <a href="' + esc(whatsapp('Hola, quiero revisar si puedo registrar una marca.')) + '" target="_blank" rel="noopener">Escríbenos por WhatsApp</a> y la revisamos contigo.';
    }

    function pintarProgreso(entrada) {
        quitarTurnstile();
        raiz.innerHTML = '<div class="vm"><div class="vm-card vm-progreso" role="status" aria-live="polite">' +
            '<h3>Estamos revisando «' + esc(entrada.denominacion) + '»</h3>' +
            '<div class="vm-barra" aria-hidden="true"><span></span></div>' +
            '<p id="vm-estado-prog">Buscando antecedentes parecidos. Puede tardar un par de minutos; no cierres esta página.</p></div></div>';
    }

    function ejecutar() {
        if (estado.ejecutando) return;
        var entrada = leerEntrada();
        if (!CFG.turnstileSiteKey) { avisar('error', noDisponible()); return; }
        if (!entrada.denominacion) { avisar('error', 'Escribe la denominación de la marca que quieres registrar.'); $('vm-denominacion').focus(); return; }
        if (!estado.clases.length) { avisar('error', 'Elige al menos una clase de Niza.'); $('vm-clase').focus(); return; }
        if (!estado.token) { avisar('error', 'Completa la verificación de seguridad antes de continuar.'); prepararTurnstile(); return; }
        estado.ejecutando = true;
        avisar('', '');
        $('vm-ejecutar').disabled = true;
        medir('marca_estudio_iniciado', { clases: entrada.clases.length, tipo: entrada.tipo, lead_source: location.pathname.replace(/^\//, '') });

        pedirPase().then(function (r) {
            if (r.status === 200 && r.datos.permitido && r.datos.pase) {
                estado.pase = r.datos.pase;
                var p = decodificarPase(r.datos.pase);
                estado.paseVence = p && p.e ? p.e : Date.now() + 25 * 60 * 1000;
                return true;
            }
            reiniciarTurnstile();
            if (r.status === 200 && r.datos.permitido === false) { cuotaAgotada(entrada); return false; }
            if (r.status === 403) throw new Error('verificacion');
            throw new Error('servicio');
        }).then(function (continuar) {
            if (!continuar) return null;
            pintarProgreso(entrada);
            return cargarMotor().then(function () {
                return window.VerificadorMarca.estudiar(entrada, { proxyFetch: proxyFetch, clientId: function () { return CLIENTE; } });
            }).then(function (res) { return { entrada: entrada, res: res }; });
        }).then(function (out) {
            estado.ejecutando = false;
            if (!out) return;
            estado.entrada = out.entrada; estado.reporte = out.res.reporte; estado.crudo = out.res.crudo; estado.leadEnviado = false;
            guardarUltimo();
            pintarResultado(true);
        }).catch(function (e) {
            estado.ejecutando = false;
            var msg = (e && e.message) || '';
            pintarFormulario('<div class="vm-error">' + (msg === 'verificacion'
                ? 'No pudimos verificar que eres una persona. Inténtalo de nuevo.'
                : noDisponible(/Límite/.test(msg) ? 'Ya se usó el estudio gratuito de este mes desde tu conexión.' : '')) + '</div>');
            restaurarEntrada(entrada);
            prepararTurnstile();
        });
    }

    function restaurarEntrada(e) {
        if (!$('vm-denominacion')) return;
        $('vm-denominacion').value = e.denominacion; $('vm-tipo').value = e.tipo; $('vm-giro').value = e.productos;
        estado.clases = e.clases.slice(); pintarChips();
    }

    function cuotaAgotada(entrada) {
        var ultimo = leer(CLAVE_ULTIMO);
        pintarFormulario('<div class="vm-error">Desde tu conexión ya se hizo el estudio gratuito de este mes. ' +
            (ultimo ? 'Puedes volver a ver tu último resultado. ' : '') +
            'Si quieres revisar otra marca, <a href="' + esc(whatsapp('Hola, ya usé el verificador de marca este mes y quiero revisar otra denominación: ' + entrada.denominacion)) +
            '" target="_blank" rel="noopener">escríbenos por WhatsApp</a> y la revisamos contigo.</div>');
        restaurarEntrada(entrada);
        prepararTurnstile();
    }

    // Lo último que se estudió, ligero, para no perderlo al recargar (solo en este navegador).
    function guardarUltimo() {
        var rep = estado.reporte;
        var ligero = Object.assign({}, rep, { antecedentes: rep.antecedentes.filter(function (a) { return a.riesgo !== 'bajo' || a.similitud.puntaje >= 60; }).slice(0, 80) });
        guardar(CLAVE_ULTIMO, { fecha: Date.now(), entrada: estado.entrada, reporte: ligero, leadEnviado: estado.leadEnviado });
    }

    function mostrarUltimo() {
        var u = leer(CLAVE_ULTIMO);
        if (!u || !u.reporte) return;
        estado.entrada = u.entrada; estado.reporte = u.reporte; estado.crudo = null; estado.leadEnviado = !!u.leadEnviado;
        cargarMotor().then(function () { pintarResultado(false); }).catch(function () { avisar('error', noDisponible()); });
    }

    // ------------------------------------------------------------------ resultado público
    var SEMAFORO = {
        alta: { color: 'verde', titulo: 'Panorama favorable', luz: 'verde', texto: 'No encontramos antecedentes que, a primera vista, impidan registrar esta denominación en las clases que elegiste.' },
        media: { color: 'ambar', titulo: 'Con reservas', luz: 'ambar', texto: 'Encontramos antecedentes o puntos de la denominación que conviene revisar antes de presentar la solicitud. El registro podría ser posible, con reservas.' },
        baja: { color: 'rojo', titulo: 'Riesgo alto', luz: 'rojo', texto: 'Encontramos antecedentes parecidos que podrían ser un obstáculo para el registro, o la denominación tiene un problema propio de registrabilidad. Antes de pagar la solicitud conviene una revisión a fondo.' },
        incompleta: { color: 'gris', titulo: 'No concluyente', luz: 'gris', texto: 'No pudimos concluir el estudio porque las consultas al IMPI no respondieron. Puedes intentarlo otra vez en unos minutos.' }
    };

    function resumen(rep) {
        var V = window.VerificadorMarca;
        var grupos = V.agruparMarcas(rep.antecedentes || []).filter(function (a) { return !a.descartado; });
        var alto = grupos.filter(function (a) { return a.riesgo === 'alto'; }).length;
        var medio = grupos.filter(function (a) { return a.riesgo === 'medio'; }).length;
        return { total: grupos.length, alto: alto, medio: medio, graves: alto + medio, grupos: grupos };
    }

    function pintarResultado(esNuevo) {
        var rep = estado.reporte, e = estado.entrada;
        var s = SEMAFORO[rep.dictamen.nivel] || SEMAFORO.incompleta;
        var r = resumen(rep);
        var incompleta = rep.dictamen.nivel === 'incompleta';
        var puedeReintentar = !!(estado.crudo && estado.pase && window.VerificadorMarca.faltantes(rep).length && estado.paseVence > Date.now() + 20000);
        var luces = ['rojo', 'ambar', 'verde'].map(function (c) {
            return '<span class="vm-luz ' + c + (s.luz === c ? ' on' : '') + '"></span>';
        }).join('');
        var wa = whatsapp('Hola, usé el verificador de marca en su sitio. Mi denominación es «' + e.denominacion + '» (clases ' + e.clases.join(', ') +
            ') y el resultado fue: ' + s.titulo.toLowerCase() + '. Me gustaría revisarla con un abogado.');

        quitarTurnstile();
        var cuerpo =
            '<div class="vm"><section class="vm-card" aria-labelledby="vm-titulo-res">' +
                '<div class="vm-resultado">' +
                    '<div class="vm-semaforo ' + s.color + '" role="img" aria-label="Semáforo: ' + esc(s.titulo) + '">' + luces + '</div>' +
                    '<div>' +
                        '<p class="vm-meta">«' + esc(e.denominacion) + '» · clases ' + esc(e.clases.join(', ')) + '</p>' +
                        '<h3 class="vm-veredicto ' + s.color + '" id="vm-titulo-res" tabindex="-1">' + esc(s.titulo) + '</h3>' +
                        '<p>' + esc(s.texto) + (rep.dictamen.parcial ? ' Una de las consultas no respondió, así que el resultado es parcial.' : '') + '</p>' +
                        (incompleta ? '' : '<div class="vm-conteo"><b>' + num(r.total) + '</b><span>' + plural(r.total, 'antecedente parecido encontrado', 'antecedentes parecidos encontrados') +
                            (desgloseRiesgo(r) ? ' · ' + desgloseRiesgo(r) : '') + '</span></div>') +
                    '</div>' +
                '</div>' +
                '<p class="vm-aviso" role="note"><strong>Importante.</strong> ' + esc(AVISO) + '</p>' +
                '<div class="vm-acciones">' +
                    (puedeReintentar ? '<button type="button" class="vm-btn" id="vm-reintentar">Reintentar lo que faltó</button>' : '') +
                    '<a class="vm-btn vm-btn-wa" href="' + esc(wa) + '" target="_blank" rel="noopener" id="vm-wa">Hablar con un abogado por WhatsApp</a>' +
                    '<button type="button" class="vm-btn vm-btn-sec" id="vm-otro">Revisar otra marca</button>' +
                '</div>' +
            '</section>' +
            (incompleta ? '' : '<div id="vm-detalle">' + (estado.leadEnviado ? '' : bloqueo()) + '</div>') +
            '</div>';
        raiz.innerHTML = cuerpo;
        $('vm-otro').addEventListener('click', function () { estado.clases = []; pintarFormulario(); prepararTurnstile(); });
        if ($('vm-reintentar')) $('vm-reintentar').addEventListener('click', reintentar);
        if ($('vm-lead')) $('vm-lead').addEventListener('submit', function (ev) { ev.preventDefault(); enviarLead(); });
        if (estado.leadEnviado && !incompleta) pintarDetalle();
        var t = $('vm-titulo-res');
        if (t && esNuevo) { t.focus({ preventScroll: true }); raiz.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        if (esNuevo) medir('marca_resultado_mostrado', { semaforo: s.color, antecedentes: r.total, riesgo_alto: r.alto, para_revisar: r.graves, clases: e.clases.length });
    }

    function reintentar() {
        var b = $('vm-reintentar');
        if (b) { b.disabled = true; b.textContent = 'Reintentando…'; }
        window.VerificadorMarca.reintentar(estado.entrada, estado.crudo, estado.reporte, { proxyFetch: proxyFetch, clientId: function () { return CLIENTE; } })
            .then(function (res) { estado.reporte = res.reporte; estado.crudo = res.crudo; guardarUltimo(); pintarResultado(false); })
            .catch(function () { pintarResultado(false); avisar('error', noDisponible()); });
    }

    // ------------------------------------------------------------------ desbloqueo con datos de contacto
    function bloqueo() {
        return '<form class="vm-card vm-bloqueo" id="vm-lead" novalidate aria-labelledby="vm-titulo-lead">' +
            '<h3 id="vm-titulo-lead">Desbloquea el dictamen detallado</h3>' +
            '<p>Déjanos tus datos y verás al momento el detalle de tu estudio. Un abogado de Empírica Legal Lab podrá comentarlo contigo.</p>' +
            '<ul class="vm-lista"><li>Los antecedentes concretos: marca, clase, estatus y titular</li>' +
            '<li>Observaciones sobre la registrabilidad de la denominación</li>' +
            '<li>Las clases relacionadas que conviene revisar</li>' +
            '<li>Recomendaciones para los siguientes pasos</li></ul>' +
            '<div id="vm-mensaje-lead" role="alert"></div>' +
            '<div class="vm-campo"><label for="vm-nombre">Nombre <span class="vm-req">*</span></label><input type="text" id="vm-nombre" autocomplete="name" maxlength="120" required></div>' +
            '<div class="vm-fila" style="grid-template-columns:1fr 1fr">' +
                '<div class="vm-campo"><label for="vm-correo">Correo <span class="vm-req">*</span></label><input type="email" id="vm-correo" autocomplete="email" maxlength="160" required></div>' +
                '<div class="vm-campo"><label for="vm-whats">WhatsApp <span class="vm-req">*</span></label><input type="tel" id="vm-whats" autocomplete="tel" inputmode="tel" maxlength="40" placeholder="998 123 4567" required></div>' +
            '</div>' +
            '<div class="vm-trampa" aria-hidden="true"><label>No llenar este campo<input type="text" id="vm-trampa" tabindex="-1" autocomplete="off"></label></div>' +
            '<label class="vm-consent"><input type="checkbox" id="vm-consent" required> <span>Acepto el <a href="aviso-de-privacidad.html" target="_blank" rel="noopener">aviso de privacidad</a> y que Empírica Legal Lab me contacte por correo o WhatsApp sobre mi consulta.</span></label>' +
            '<button type="submit" class="vm-btn" id="vm-enviar-lead">Ver dictamen detallado</button>' +
            '</form>';
    }

    function validarLead() {
        var nombre = ($('vm-nombre').value || '').trim(), correo = ($('vm-correo').value || '').trim(), tel = ($('vm-whats').value || '').trim();
        if (nombre.length < 2) return 'Escribe tu nombre.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return 'Escribe un correo válido.';
        if (tel.replace(/\D/g, '').length < 10) return 'Escribe tu WhatsApp con lada (10 dígitos).';
        if (!$('vm-consent').checked) return 'Para continuar, acepta el aviso de privacidad.';
        return '';
    }

    function mensajeLead() {
        var rep = estado.reporte, e = estado.entrada, r = resumen(rep), s = SEMAFORO[rep.dictamen.nivel] || SEMAFORO.incompleta;
        var principales = r.grupos.filter(function (a) { return a.riesgo === 'alto' || a.riesgo === 'medio'; }).slice(0, 5).map(function (a) {
            return '«' + a.titulo + '» (clase ' + (a.clases.join(', ') || '?') + (a.estado ? ', ' + a.estado : '') + ', riesgo ' + a.riesgo + ')';
        });
        var lineas = ['Verificador de viabilidad de marca (sitio).',
            'Denominación: ' + e.denominacion + ' | Tipo: ' + e.tipo + ' | Clases: ' + e.clases.join(', '),
            e.productos ? 'Giro: ' + e.productos : '',
            'Semáforo: ' + s.color + ' (' + rep.dictamen.titulo + '). Antecedentes parecidos: ' + r.total + ' (' + r.alto + ' de riesgo alto, ' + r.medio + ' de riesgo medio).',
            principales.length ? 'Principales: ' + principales.join('; ') + '.' : '',
            'Aceptó el aviso de privacidad en el formulario.'];
        return lineas.filter(Boolean).join('\n').slice(0, 2800);
    }

    function campana() {
        var p = new URLSearchParams(location.search), partes = [];
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach(function (k) { if (p.get(k)) partes.push(k + '=' + p.get(k)); });
        return partes.join(' · ').slice(0, 300);
    }

    function enviarLead() {
        var error = validarLead();
        var aviso = $('vm-mensaje-lead');
        if (error) { aviso.innerHTML = '<div class="vm-error">' + esc(error) + '</div>'; return; }
        var urlContacto = window.EMPIRICA_APPS_SCRIPT && window.EMPIRICA_APPS_SCRIPT.contacto;
        var datos = {
            nombre: $('vm-nombre').value.trim(), correo: $('vm-correo').value.trim(), telefono: $('vm-whats').value.trim(),
            perfil: 'verificador-marca', mensaje: mensajeLead(), sitio_web: $('vm-trampa').value,
            pagina: location.pathname.replace(/^\//, '') || 'index.html', idioma: document.documentElement.lang || '', campana: campana(), referente: (document.referrer || '').slice(0, 300)
        };
        var wa = whatsapp('Hola, soy ' + datos.nombre + '. Usé el verificador de marca para «' + estado.entrada.denominacion + '» y quiero revisar el resultado con un abogado.');
        var falla = function () {
            $('vm-enviar-lead').disabled = false; $('vm-enviar-lead').textContent = 'Ver dictamen detallado';
            aviso.innerHTML = '<div class="vm-error">No pudimos enviar tus datos. Inténtalo de nuevo o <a href="' + esc(wa) + '" target="_blank" rel="noopener">escríbenos por WhatsApp</a>.</div>';
        };
        if (!urlContacto) { falla(); return; }
        $('vm-enviar-lead').disabled = true; $('vm-enviar-lead').textContent = 'Enviando…';
        // Como texto plano: el navegador no pide permiso de CORS antes de enviarlo (igual que el formulario de contacto del sitio).
        fetch(urlContacto, { method: 'POST', body: JSON.stringify(datos) })
            .then(function (r) { return r.json(); })
            .then(function (r) {
                if (!r || r.status !== 'ok') throw new Error('error');
                estado.leadEnviado = true;
                guardarUltimo();
                var s = SEMAFORO[estado.reporte.dictamen.nivel] || SEMAFORO.incompleta;
                medir('generate_lead', { method: 'verificador_marca', lead_source: location.pathname.replace(/^\//, ''), semaforo: s.color });
                var cont = $('vm-detalle');
                cont.innerHTML = '';
                pintarDetalle();
            })
            .catch(falla);
    }

    // ------------------------------------------------------------------ dictamen detallado (solo tras el desbloqueo)
    function pintarDetalle() {
        var V = window.VerificadorMarca, rep = estado.reporte, e = estado.entrada, d = rep.dictamen;
        var cont = $('vm-detalle');
        var utiles = V.agruparMarcas(rep.antecedentes || []).filter(function (a) { return !a.descartado; });
        var resu = resumen(rep);
        var relevantes = utiles.filter(function (a) { return a.riesgo !== 'bajo' || a.similitud.puntaje >= 75; }).slice(0, 12);
        var ETIQ = { alto: 'Alto', medio: 'Medio', bajo: 'Bajo', propia: 'Propia' };
        var filas = relevantes.map(function (a) {
            var num = a.registro ? 'Reg. ' + a.registro : a.expediente ? 'Exp. ' + a.expediente : '';
            return '<tr><td data-etiqueta="Riesgo"><span class="vm-riesgo ' + a.riesgo + '">' + ETIQ[a.riesgo] + '</span></td>' +
                '<td data-etiqueta="Marca"><strong>' + esc(a.titulo) + '</strong>' + (num ? '<br><small>' + esc(num) + (a.miembros.length > 1 ? ' y ' + (a.miembros.length - 1) + ' más' : '') + '</small>' : '') + '</td>' +
                '<td data-etiqueta="Clase">' + esc(a.clases.join(', ') || '—') + '</td>' +
                '<td data-etiqueta="Estatus">' + esc(a.estado || '—') + '</td>' +
                '<td data-etiqueta="Titular">' + esc(a.titulares.slice(0, 1).join('') || '—') + '</td>' +
                '<td data-etiqueta="Parecido">' + a.similitud.puntaje + '%</td></tr>';
        }).join('');
        var relac = (rep.relacionadas || []).map(function (n) { return n + ' (' + esc(NIZA[n] || (V.CLASES_NIZA || {})[n] || '') + ')'; });
        // Las más recientes primero (la Gaceta trae también publicaciones muy antiguas).
        var pubsOrdenadas = (rep.publicaciones || []).slice().sort(function (a, b) {
            var fa = V.fechaIMPI ? V.fechaIMPI(a.fecha) : null, fb = V.fechaIMPI ? V.fechaIMPI(b.fecha) : null;
            return (fb == null ? -1 : fb) - (fa == null ? -1 : fa) || b.similitud.puntaje - a.similitud.puntaje;
        });
        var pubs = pubsOrdenadas.slice(0, 5).map(function (p) {
            return '<li>«' + esc(p.denominacion) + '» · clase ' + esc(p.clases.join(', ') || 'sin dato') + ' · ' + esc(p.gaceta) + (p.ejemplar ? ', ' + esc(p.ejemplar) : '') + '</li>';
        }).join('');
        var wa = whatsapp('Hola, ya vi el dictamen del verificador de marca para «' + e.denominacion + '» (clases ' + e.clases.join(', ') + '). Quiero revisarlo con un abogado.');
        cont.innerHTML =
            '<section class="vm-card" aria-labelledby="vm-titulo-detalle">' +
                '<div class="vm-ok" role="status">Gracias, ' + 'recibimos tus datos. Aquí está tu dictamen detallado; un abogado podrá comentarlo contigo.</div>' +
                '<h3 id="vm-titulo-detalle" tabindex="-1">Dictamen detallado: «' + esc(e.denominacion) + '»</h3>' +
                '<p>' + esc(d.resumen) + '</p>' +
                (resu.total ? '<p class="vm-ayuda">Se encontraron ' + num(resu.total) + ' antecedentes parecidos' + (desgloseRiesgo(resu) ? ' (' + desgloseRiesgo(resu) + ')' : '') +
                    '. Aquí van los ' + num(relevantes.length) + ' principales, de mayor a menor riesgo.</p>' : '') +
                (rep.observaciones && rep.observaciones.length ? '<div class="vm-seccion"><h4>Sobre la denominación</h4><ul class="vm-obs">' +
                    rep.observaciones.map(function (o) { return '<li class="' + esc(o.nivel) + '">' + esc(o.texto) + '</li>'; }).join('') + '</ul></div>' : '') +
                '<div class="vm-seccion"><h4>Antecedentes a considerar</h4>' + (filas
                    ? '<div class="vm-tabla-marco"><table class="vm-tabla"><thead><tr><th>Riesgo</th><th>Marca</th><th>Clase</th><th>Estatus</th><th>Titular</th><th>Parecido</th></tr></thead><tbody>' + filas + '</tbody></table></div>'
                    : '<p>Ningún antecedente se parece lo suficiente para considerarse.</p>') + '</div>' +
                (relac.length ? '<div class="vm-seccion"><h4>Clases relacionadas</h4><p>Estas clases suelen considerarse relacionadas con las que elegiste (orientativo; no todas aplican a tu negocio y las revisamos contigo según lo que ofreces): ' + relac.join('; ') + '.</p></div>' : '') +
                (pubs ? '<div class="vm-seccion"><h4>Publicaciones en Gaceta relacionadas</h4><ul class="vm-recs">' + pubs + '</ul></div>' : '') +
                '<div class="vm-seccion"><h4>Recomendaciones</h4><ul class="vm-recs">' + (rep.recomendaciones || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
                '<p class="vm-aviso" role="note"><strong>Importante.</strong> ' + esc(AVISO) + '</p>' +
                '<div class="vm-acciones"><a class="vm-btn vm-btn-wa" href="' + esc(wa) + '" target="_blank" rel="noopener">Revisar mi dictamen con un abogado</a></div>' +
            '</section>';
        var t = $('vm-titulo-detalle');
        if (t) t.focus({ preventScroll: true });
    }

    // ------------------------------------------------------------------ arranque
    if (!CFG.turnstileSiteKey) {
        pintarFormulario('<div class="vm-error">' + noDisponible() + '</div>');
    } else {
        pintarFormulario();
    }
})();
