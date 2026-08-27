/* ==========================================================
   EMPÍRICA LEGAL LAB — Main JavaScript
   ========================================================== */

(function () {
    'use strict';

    /* ── CONFIGURACIÓN ── */

    /* Google Sheets como base de datos de suscriptores.
     * Para activar el newsletter:
     * 1. Crea una Google Sheet nueva
     * 2. Ve a Extensiones > Apps Script
     * 3. Pega el código que está en google-apps-script.js
     * 4. Haz deploy como Web App (acceso: Anyone)
     * 5. Copia la URL y pégala aquí:
     */
    var GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyX3vgUvGcldyU3oUdvqhU3LLoPKNuOX4jb8LHaU7HgQQDIzmseHTV-CqjHKkRZFmJz/exec'; // https://script.google.com/macros/s/TU_ID/exec

    /* Número de WhatsApp (con código de país, sin +) */
    var WHATSAPP_NUMBER = '529981399930';

    /* ── DATOS DE SERVICIOS ── */
    var SERVICES = {
        'legal-english': {
            name: 'Legal English for Real Estate',
            icon: 'fa-language',
            type: 'Producto Digital',
            description: 'Material educativo completo sobre terminología legal en inglés para transacciones inmobiliarias. Ideal para profesionales del derecho, agentes inmobiliarios y emprendedores que trabajan con clientes internacionales en el sector de bienes raíces en México.',
            features: [
                'Glosario completo de términos legales inmobiliarios en inglés',
                'Plantillas de documentos bilingües',
                'Guía de referencia rápida para negociaciones',
                'Casos prácticos y ejemplos reales'
            ]
        },
        'transcripciones': {
            name: 'Transcripciones de Audio & Audiencias',
            icon: 'fa-microphone-lines',
            type: 'Producto Digital',
            description: 'Servicio profesional de transcripción de audiencias judiciales, grabaciones de audio y material legal. Entrega rápida, precisa y con formato profesional listo para uso en procedimientos legales.',
            features: [
                'Transcripción precisa de audiencias judiciales',
                'Formato profesional para uso legal',
                'Entrega rápida y confiable',
                'Manejo confidencial de la información'
            ]
        },
        'corresponsalias': {
            name: 'Corresponsalías',
            icon: 'fa-handshake',
            type: 'Suscripción Mensual',
            description: 'Representación legal confiable en diferentes estados de la República Mexicana. Servicio de corresponsalía mensual para dar seguimiento continuo a tus asuntos legales donde los necesites, sin importar la ubicación geográfica.',
            features: [
                'Red de abogados corresponsales en toda la República',
                'Seguimiento continuo de tus asuntos legales',
                'Reportes mensuales de actividades',
                'Comunicación directa con el abogado corresponsal'
            ]
        },
        'litigio': {
            name: 'Litigio / Juicio de Amparo',
            icon: 'fa-gavel',
            type: 'Servicio Legal',
            description: 'Defensa y representación legal especializada en juicios de amparo y litigio. Protegemos tus derechos constitucionales con estrategia jurídica sólida y experiencia comprobada. Análisis de viabilidad, elaboración de demanda y seguimiento completo.',
            features: [
                'Análisis de viabilidad del amparo',
                'Elaboración y presentación de demanda',
                'Seguimiento procesal completo',
                'Defensa de derechos constitucionales'
            ]
        },
        'aviso-privacidad': {
            name: 'Aviso de Privacidad',
            icon: 'fa-shield-halved',
            type: 'Servicio Legal',
            description: 'Elaboración de avisos de privacidad personalizados conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP). Cumple con la normativa vigente y protege tu negocio de sanciones.',
            features: [
                'Aviso de privacidad integral personalizado',
                'Cumplimiento con LFPDPPP',
                'Adaptado al giro de tu negocio',
                'Versiones simplificada y completa'
            ]
        },
        'consulta': {
            name: 'Consulta Personalizada',
            icon: 'fa-comments',
            type: 'Reserva · 60 min',
            description: 'Sesión de 60 minutos donde analizamos tu caso a profundidad, resolvemos todas tus dudas legales y definimos la mejor estrategia jurídica para tu proyecto o negocio. Atención personalizada y directa con nuestro equipo.',
            features: [
                'Sesión privada de 60 minutos',
                'Análisis personalizado de tu caso',
                'Estrategia legal a la medida',
                'Seguimiento posterior por escrito'
            ]
        },
        'registro-marca': {
            name: 'Registro de Marca',
            icon: 'fa-registered',
            type: 'Servicio Legal',
            description: 'Protege la identidad de tu marca ante el Instituto Mexicano de la Propiedad Industrial (IMPI). Incluye búsqueda de disponibilidad, preparación completa de la solicitud y seguimiento del trámite hasta obtener tu registro.',
            features: [
                'Búsqueda de disponibilidad ante IMPI',
                'Preparación y presentación de solicitud',
                'Seguimiento completo del trámite',
                'Asesoría sobre clases y alcance de protección'
            ]
        },
        'sociedad-juridica': {
            name: 'Creación de Sociedad Jurídica Express',
            icon: 'fa-building-columns',
            type: 'Servicio Legal',
            description: 'Constitución rápida y eficiente de tu sociedad mercantil. Incluye elaboración del acta constitutiva, inscripción ante el Registro Público de Comercio y asesoría sobre los trámites iniciales que necesitas para operar.',
            features: [
                'Elaboración de acta constitutiva',
                'Inscripción ante el Registro Público',
                'Asesoría sobre tipo de sociedad ideal',
                'Trámites iniciales de operación'
            ]
        },
        'derechos-autor': {
            name: 'Derechos de Autor',
            icon: 'fa-copyright',
            type: 'Servicio Legal',
            description: 'Registro y protección de obras artísticas, literarias, musicales, fotográficas y de software ante el Instituto Nacional del Derecho de Autor (INDAUTOR). Asegura la titularidad legal de tus creaciones originales.',
            features: [
                'Registro ante INDAUTOR',
                'Protección de obras en todas las categorías',
                'Asesoría sobre alcance de derechos',
                'Defensa ante infracciones'
            ]
        },
        'contratos': {
            name: 'Contratos Personalizados',
            icon: 'fa-file-signature',
            type: 'Servicio Legal',
            description: 'Redacción profesional de contratos a la medida de tus necesidades. Contratos mercantiles, civiles, laborales, de arrendamiento, prestación de servicios, compraventa, confidencialidad (NDA) y cualquier otro tipo que requieras.',
            features: [
                'Redacción a la medida de tu necesidad',
                'Contratos mercantiles, civiles y laborales',
                'Cláusulas de protección personalizadas',
                'Revisión y ajustes incluidos'
            ]
        },
        'hospitality-advisory': {
            name: 'Hotels, Boutique Hotels & Short-Term Rentals — Legal & Operational Advisory',
            icon: 'fa-hotel',
            type: 'Servicio Empresarial',
            description: 'Proporcionamos asesoría legal y operativa estratégica a hoteles, hoteles boutique y operadores de rentas vacacionales (Airbnb) en Quintana Roo. Apoyamos a propietarios de hoteles, inversionistas en hospitalidad y accionistas en la protección del valor de sus activos, estabilización de operaciones y mejora de la rentabilidad dentro de un entorno turístico altamente regulado. Nuestro enfoque se centra en identificar ineficiencias operativas, reducir la exposición regulatoria y fiscal, y fortalecer las estructuras contractuales, laborales y corporativas que impactan directamente el desempeño financiero.',
            features: [
                'Auditorías operativas y de proveedores para mejorar eficiencia y rentabilidad',
                'Análisis de exposición fiscal y estrategia de cumplimiento para plataformas de renta vacacional',
                'Redacción y negociación de contratos de administración, proveeduría y operación',
                'Mitigación de riesgos laborales y de outsourcing para operaciones hoteleras',
                'Estrategias de prevención de responsabilidad con huéspedes y resolución de disputas',
                'Estructuración corporativa y protección de activos para inversionistas en hospitalidad',
                'Asesoría preventiva y soporte en negociaciones ante SAT, SEFIPLAN, IMSS, INFONAVIT y Secretaría del Trabajo'
            ]
        },
        'compliance-preventivo': {
            name: 'Compliance y Fiscalización Preventiva',
            icon: 'fa-scale-balanced',
            type: 'Servicio Empresarial',
            description: 'Programa integral de derecho preventivo diseñado para hoteles, corporativos y empresas que buscan anticiparse a riesgos regulatorios y fiscales. Nuestro equipo, con experiencia directa en la mitigación de riesgos de empresas transnacionales, ejecuta ejercicios de prevención en fiscalización, cumplimiento normativo y blindaje jurídico en diversas materias administrativas y fiscales.',
            features: [
                'Auditorías preventivas en materia fiscal (SAT, ISR, IVA, IEPS)',
                'Diagnóstico de riesgos regulatorios y administrativos',
                'Estrategias de cumplimiento normativo (compliance corporativo)',
                'Prevención en materia laboral, ambiental y de protección de datos',
                'Revisión de obligaciones ante autoridades municipales, estatales y federales',
                'Ejercicios de fiscalización simulada para preparación ante auditorías',
                'Asesoría especializada para el sector hotelero y turístico',
                'Diseño de políticas internas de prevención y gobierno corporativo'
            ]
        },
        'due-diligence-inmob': {
            name: 'Consultoría Preventiva y Transaccional',
            icon: 'fa-magnifying-glass-chart',
            type: 'Servicio Legal',
            description: 'Servicio integral de consultoría inmobiliaria para dar certeza jurídica a clientes nacionales y extranjeros en cada transacción. Realizamos investigación exhaustiva de la situación legal del inmueble, análisis de cadena de propiedad y redacción de contratos especializados.',
            features: [
                'Due diligence inmobiliario: antecedentes registrales, libertad de gravámenes, prediales, servicios y situación fiscal',
                'Dictaminación de títulos: análisis de la cadena de propiedad para detectar vicios ocultos o riesgos de nulidad',
                'Contratos de compraventa, promesa, permuta y donación',
                'Estructuración y acompañamiento en fideicomisos inmobiliarios'
            ]
        },
        'extranjeros-fideicomiso': {
            name: 'Servicios para Extranjeros y Zonas Restringidas',
            icon: 'fa-earth-americas',
            type: 'Servicio Legal',
            description: 'Acompañamiento legal especializado para inversionistas extranjeros que adquieren inmuebles en México. Constitución de fideicomisos en zona restringida (50 km de costa, 100 km de frontera) y creación de sociedades mexicanas con cláusula de admisión de extranjeros para fines comerciales o residenciales.',
            features: [
                'Fideicomisos de zona restringida: constitución, cesión de derechos y extinción',
                'Constitución de sociedades mexicanas con cláusula de admisión de extranjeros',
                'Asesoría para inversión inmobiliaria residencial y comercial',
                'Acompañamiento ante notarios, Registro Público y Secretaría de Relaciones Exteriores'
            ]
        },
        'litigio-inmobiliario': {
            name: 'Defensa Jurídica y Litigio Inmobiliario',
            icon: 'fa-scale-balanced',
            type: 'Servicio Legal',
            description: 'Defensa y representación legal especializada en controversias inmobiliarias. Protegemos su propiedad y sus derechos ante tribunales civiles y federales con estrategia jurídica sólida y experiencia en la materia.',
            features: [
                'Juicios reivindicatorios y de usucapión: defensa de la propiedad y regularización de posesiones',
                'Juicios de arrendamiento inmobiliario: desocupación por falta de pago o rescisión de contrato',
                'Amparo en materia inmobiliaria: protección contra clausuras injustificadas de obras o expropiaciones',
                'Defensa ante actos de autoridad que afecten la propiedad inmobiliaria'
            ]
        },
        'representacion-influencers': {
            name: 'Representación Legal de Influencers y Creadores',
            icon: 'fa-star',
            type: 'Management Digital',
            description: 'Representamos comercialmente a influencers y creadores de contenido ante marcas, agencias y anunciantes. Negociamos campañas, elaboramos contratos, gestionamos derechos de imagen y manejamos el régimen fiscal bajo el esquema de asimilados a salarios. Tú creas — nosotros gestionamos todo lo demás.',
            features: [
                'Negociación de campañas, sponsorships y colaboraciones con marcas',
                'Contratos de representación y licencia de derechos de imagen',
                'Gestión fiscal: retenciones de ISR y CFDI bajo régimen de asimilados a salarios',
                'Rendición de cuentas mensual: campañas, montos cobrados y liquidaciones',
                'Asesoría legal continua en normativa publicitaria y cumplimiento PROFECO',
                'Exclusividad comercial con 85% del ingreso neto para el creador'
            ]
        },
        'conexion-talento-ugc': {
            name: 'Conexión de Marcas con Talento Digital',
            icon: 'fa-people-arrows',
            type: 'Servicio Empresarial',
            description: 'Conectamos marcas y anunciantes con los creadores de contenido de nuestra cartera representada. Gestionamos la conexión, el marco contractual, los derechos de uso y la coordinación del proyecto. El contenido lo produce el talento con sus propios recursos; nosotros somos el intermediario legal y comercial de todo el proceso.',
            features: [
                'Selección del talento de nuestra cartera según brief, nicho y audiencia',
                'Coordinación del proyecto: brief, lineamientos, revisiones y aprobaciones',
                'Contrato formal con licencia de uso por plataforma, plazo y territorio',
                'Cláusulas expresas de protección contra uso de imagen con inteligencia artificial',
                'Cumplimiento de normativa publicitaria: PROFECO, disclosure y políticas de plataformas',
                'CFDI e IVA incluidos en cada transacción'
            ]
        }
    };

    /* ──────────────────────────────────────────────────
       DOM Ready
       ────────────────────────────────────────────────── */
    /* URL del Google Apps Script para reseñas (opcional — ver google-apps-script-reviews.js) */
    var GOOGLE_REVIEWS_URL = 'https://script.google.com/macros/s/AKfycbwNC-E8ZdUxDJu3tQHbz0FQz3ZvZoFqxIZSa9dSL8zNsDCmMx1_VYFQbUjMLl9XFQCbcg/exec'; // Pega aquí la URL de tu Apps Script para reseñas

    document.addEventListener('DOMContentLoaded', function () {
        initNavbar();
        initMobileMenu();
        initServiceTabs();
        initSubscribeModal();
        initServiceModals();
        initForms();
        initScrollAnimations();
        initSmoothScroll();
        initGoogleReviews();
        initLanguageToggle();
    });

    /* ──────────────────────────────────────────────────
       Navbar Scroll Effect
       ────────────────────────────────────────────────── */
    function initNavbar() {
        var navbar = document.getElementById('navbar');
        if (!navbar) return;

        function onScroll() {
            if (window.scrollY > 60) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ──────────────────────────────────────────────────
       Mobile Menu
       ────────────────────────────────────────────────── */
    function initMobileMenu() {
        var toggle = document.getElementById('nav-toggle');
        var links = document.getElementById('nav-links');
        if (!toggle || !links) return;

        toggle.addEventListener('click', function () {
            links.classList.toggle('open');
            toggle.classList.toggle('active');
        });

        var navAnchors = links.querySelectorAll('a');
        navAnchors.forEach(function (anchor) {
            anchor.addEventListener('click', function () {
                links.classList.remove('open');
                toggle.classList.remove('active');
            });
        });

        document.addEventListener('click', function (e) {
            if (!links.contains(e.target) && !toggle.contains(e.target)) {
                links.classList.remove('open');
                toggle.classList.remove('active');
            }
        });
    }

    /* ──────────────────────────────────────────────────
       Service Category Tabs
       ────────────────────────────────────────────────── */
    function initServiceTabs() {
        var tabs = document.querySelectorAll('.services-tab');
        var categories = document.querySelectorAll('.services-category');
        if (!tabs.length || !categories.length) return;

        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                var targetCategory = this.getAttribute('data-category');

                // Update tab states
                tabs.forEach(function (t) {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');

                // Update category panels
                categories.forEach(function (cat) {
                    cat.classList.remove('active');
                });
                var targetPanel = document.getElementById('cat-' + targetCategory);
                if (targetPanel) {
                    targetPanel.classList.add('active');

                    // Re-trigger scroll animations for newly visible cards
                    var newCards = targetPanel.querySelectorAll('.service-card');
                    newCards.forEach(function (card, index) {
                        card.classList.remove('animated');
                        setTimeout(function () {
                            card.classList.add('animated');
                        }, index * 80);
                    });
                }
            });
        });
    }

    /* ──────────────────────────────────────────────────
       Subscribe Modal
       ────────────────────────────────────────────────── */
    function initSubscribeModal() {
        var modal = document.getElementById('subscribe-modal');
        var closeBtn = document.getElementById('modal-close');
        if (!modal) return;

        var hasBeenShown = sessionStorage.getItem('empirica_modal_shown');

        if (!hasBeenShown) {
            setTimeout(function () {
                modal.classList.add('active');
                sessionStorage.setItem('empirica_modal_shown', 'true');
            }, 3000);
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                modal.classList.remove('active');
            });
        }

        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });
    }

    /* ──────────────────────────────────────────────────
       Service Detail Modals
       ────────────────────────────────────────────────── */
    function initServiceModals() {
        var serviceModal = document.getElementById('service-modal');
        var serviceDetail = document.getElementById('service-detail');
        var closeBtn = document.getElementById('service-modal-close');

        if (!serviceModal || !serviceDetail) return;

        // Click on service cards
        var cards = document.querySelectorAll('.service-card');
        cards.forEach(function (card) {
            card.addEventListener('click', function (e) {
                // Don't open modal if clicking on the button directly (it also opens modal but via different path)
                var serviceId = this.getAttribute('data-service');
                openServiceModal(serviceId);
            });

            // Keyboard accessibility
            card.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    var serviceId = this.getAttribute('data-service');
                    openServiceModal(serviceId);
                }
            });
        });

        // Consulta CTA button
        var consultaCta = document.querySelector('.btn-consulta-cta');
        if (consultaCta) {
            consultaCta.addEventListener('click', function () {
                openServiceModal('consulta');
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                serviceModal.classList.remove('active');
            });
        }

        serviceModal.addEventListener('click', function (e) {
            if (e.target === serviceModal) {
                serviceModal.classList.remove('active');
            }
        });
    }

    function openServiceModal(serviceId) {
        var service = SERVICES[serviceId];
        if (!service) return;

        var modal = document.getElementById('service-modal');
        var detail = document.getElementById('service-detail');

        var waMessage = encodeURIComponent(
            'Hola, me interesa el servicio de "' + service.name + '" de Empírica Legal Lab. ¿Me pueden dar más información?'
        );
        var waLink = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + waMessage;

        var featuresHtml = '';
        if (service.features && service.features.length > 0) {
            featuresHtml = '<ul class="service-features">';
            service.features.forEach(function (feature) {
                featuresHtml += '<li><i class="fas fa-check"></i> ' + feature + '</li>';
            });
            featuresHtml += '</ul>';
        }

        detail.innerHTML =
            '<div class="service-detail-header">' +
                '<div class="service-detail-icon"><i class="fas ' + service.icon + '"></i></div>' +
                '<span class="service-badge-inline">' + service.type + '</span>' +
            '</div>' +
            '<h3 id="service-modal-title">' + service.name + '</h3>' +
            '<p class="service-detail-desc">' + service.description + '</p>' +
            featuresHtml +
            '<div class="service-detail-ctas">' +
                '<a href="' + waLink + '" target="_blank" rel="noopener" class="btn btn-primary btn-block">' +
                    '<i class="fab fa-whatsapp"></i> Solicitar por WhatsApp' +
                '</a>' +
                '<a href="mailto:frida@empirica.mx?subject=Consulta: ' + encodeURIComponent(service.name) + '" class="btn btn-outline-dark btn-block">' +
                    '<i class="fas fa-envelope"></i> Enviar Email' +
                '</a>' +
            '</div>';

        modal.classList.add('active');
    }

    function closeAllModals() {
        var modals = document.querySelectorAll('.modal-overlay.active');
        modals.forEach(function (modal) {
            modal.classList.remove('active');
        });
    }

    /* ──────────────────────────────────────────────────
       Forms — Newsletter con Google Sheets
       ────────────────────────────────────────────────── */
    function initForms() {
        var newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function (e) {
                e.preventDefault();
                handleFormSubmit(this, 'newsletter');
            });
        }

        var modalForm = document.getElementById('modal-form');
        if (modalForm) {
            modalForm.addEventListener('submit', function (e) {
                e.preventDefault();
                handleFormSubmit(this, 'modal');
            });
        }
    }

    function handleFormSubmit(form, type) {
        var formData = new FormData(form);
        var data = {};
        formData.forEach(function (value, key) {
            data[key] = value;
        });

        var btn = form.querySelector('button[type="submit"]');
        var originalText = btn.innerHTML;

        // Disable button while processing
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        btn.disabled = true;

        // Send to Google Sheets if configured
        if (GOOGLE_SHEET_URL) {
            fetch(GOOGLE_SHEET_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.first_name || '',
                    email: data.email,
                    source: type,
                    timestamp: new Date().toISOString()
                })
            }).then(function () {
                showFormSuccess(form, btn, originalText, type);
            }).catch(function () {
                // no-cors mode doesn't return readable response, but data is sent
                showFormSuccess(form, btn, originalText, type);
            });
        } else {
            // No backend configured — save locally and show success
            saveSubscriberLocally(data);
            showFormSuccess(form, btn, originalText, type);
        }
    }

    function showFormSuccess(form, btn, originalText, type) {
        btn.innerHTML = '<i class="fas fa-check"></i> ¡Suscrito!';
        btn.style.background = '#25D366';
        btn.style.borderColor = '#25D366';

        form.reset();

        // Show success message for newsletter form
        var successMsg = document.getElementById('newsletter-success');
        if (type === 'newsletter' && successMsg) {
            successMsg.classList.add('visible');
        }

        if (type === 'modal') {
            setTimeout(function () {
                var modal = document.getElementById('subscribe-modal');
                if (modal) modal.classList.remove('active');
            }, 2000);
        }

        setTimeout(function () {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.disabled = false;
            if (successMsg) successMsg.classList.remove('visible');
        }, 4000);
    }

    function saveSubscriberLocally(data) {
        var subscribers = JSON.parse(localStorage.getItem('empirica_subscribers') || '[]');
        subscribers.push({
            name: data.first_name || '',
            email: data.email,
            date: new Date().toISOString()
        });
        localStorage.setItem('empirica_subscribers', JSON.stringify(subscribers));
    }

    /* ──────────────────────────────────────────────────
       Scroll Animations (Intersection Observer)
       ────────────────────────────────────────────────── */
    function initScrollAnimations() {
        var sections = document.querySelectorAll('.section-header, .about-content, .about-visual, .cta-content, .newsletter-inner, .contact-card, .category-intro, .enterprise-banner, .services-consulta-cta, .reviews-summary, .review-card, .reviews-cta');
        sections.forEach(function (el) {
            el.classList.add('animate-on-scroll');
        });

        // Only animate cards in the initially active category
        var activeCategory = document.querySelector('.services-category.active');
        var serviceCards = activeCategory ? activeCategory.querySelectorAll('.service-card') : document.querySelectorAll('.service-card');

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('service-card')) {
                        var cards = Array.from(serviceCards);
                        var index = cards.indexOf(entry.target);
                        if (index === -1) index = 0;
                        setTimeout(function () {
                            entry.target.classList.add('animated');
                        }, index * 80);
                    } else {
                        entry.target.classList.add('animated');
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -60px 0px'
        });

        sections.forEach(function (el) { observer.observe(el); });
        serviceCards.forEach(function (el) { observer.observe(el); });
    }

    /* ──────────────────────────────────────────────────
       Smooth Scroll
       ────────────────────────────────────────────────── */
    function initSmoothScroll() {
        var anchors = document.querySelectorAll('a[href^="#"]');
        anchors.forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                var href = this.getAttribute('href');
                if (href === '#') return;

                var target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    var navbarHeight = document.getElementById('navbar').offsetHeight;
                    var targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /* ──────────────────────────────────────────────────
       Google Reviews (via Google Apps Script proxy)
       ────────────────────────────────────────────────── */
    function initGoogleReviews() {
        if (!GOOGLE_REVIEWS_URL) return;

        fetch(GOOGLE_REVIEWS_URL)
            .then(function (response) { return response.json(); })
            .then(function (data) {
                if (data && data.reviews && data.reviews.length > 0) {
                    renderReviews(data);
                }
            })
            .catch(function () {
                // Fallback: keep static reviews in HTML
            });
    }

    /* ──────────────────────────────────────────────────
       Language Toggle (ES / EN)
       ────────────────────────────────────────────────── */
    var TRANSLATIONS = {
        en: {
            // Navbar
            nav_services: 'Services', nav_about: 'About Us', nav_reviews: 'Reviews',
            nav_contact: 'Contact', nav_cta: 'Book Consultation',
            // Hero
            hero_tagline: 'Empowering entrepreneurs with legal insights.',
            hero_btn_services: 'View Services', hero_btn_consult: 'Book Consultation',
            // Services header
            svc_tag: 'What we do', svc_heading: 'Our Services',
            svc_subheading: 'Comprehensive legal solutions for entrepreneurs, growing companies and corporates',
            // Tabs
            tab_litigation: 'Litigation', tab_ip: 'Intellectual Property',
            tab_corporate: 'Corporate & Preventive', tab_inmobiliario: 'Real Estate',
            // Category 1
            cat1_title: 'Litigation & Legal Defense',
            cat1_desc: 'Strategic representation and legal defense with proven experience at all levels. We protect your rights with technical rigor and absolute commitment.',
            svc_litigio_title: 'Litigation / Amparo',
            svc_litigio_desc: 'Specialized legal defense and representation in amparo proceedings and litigation at all levels.',
            svc_corresponsalias_title: 'Legal Correspondents',
            svc_corresponsalias_desc: 'Legal representation across different states of Mexico with ongoing follow-up.',
            svc_transcripciones_title: 'Audio & Hearing Transcriptions',
            svc_transcripciones_desc: 'Professional transcription of court hearings and legal audio recordings.',
            // Category 2
            cat2_title: 'Copyright & Industrial Property',
            cat2_desc: 'We protect your creations, your brand and your commercial identity. Registration, defense and comprehensive advisory before IMPI and INDAUTOR to safeguard the intangible value of your business.',
            svc_marca_title: 'Trademark Registration',
            svc_marca_desc: 'Protect your brand identity before IMPI with availability search and full follow-up.',
            svc_autor_title: 'Copyright',
            svc_autor_desc: 'Registration and protection of artistic, literary, musical and software works before INDAUTOR.',
            svc_english_title: 'Legal English for Real Estate',
            svc_english_desc: 'Educational material on legal terminology in English for real estate transactions.',
            // Category 3
            cat3_badge: 'Enterprise Service',
            cat3_title: 'Corporate & Preventive Law',
            cat3_desc: 'Our team includes partners who have worked internally in risk mitigation for multinational companies. We design compliance and legal prevention strategies so your company operates with legal certainty and competitive advantage.',
            banner_title: 'Prevention & Tax Compliance Program for Corporates & Hospitality Sector',
            banner_desc: 'Designed for CEOs, legal directors, hotel owners, hospitality investors and vacation rental operators seeking to mitigate regulatory, tax and administrative risks before they become contingencies.',
            svc_hotels_title: 'Hotels, Boutique Hotels & Short-Term Rentals',
            svc_hotels_desc: 'Strategic legal and operational advisory for hotels, boutique hotels and vacation rental operators in Quintana Roo. Asset protection, regulatory compliance and profitability optimization.',
            svc_compliance_title: 'Compliance & Preventive Tax Review',
            svc_compliance_desc: 'Preventive audits, regulatory risk analysis and compliance strategies in tax, administrative, labor and data protection matters for hotels and corporates.',
            svc_sociedad_title: 'Express Company Incorporation',
            svc_sociedad_desc: 'Fast incorporation of your company with articles of incorporation and procedures included.',
            svc_contratos_title: 'Custom Contracts',
            svc_contratos_desc: 'Tailored contract drafting: commercial, civil, labor, lease and more.',
            svc_privacidad_title: 'Privacy Notice',
            svc_privacidad_desc: 'Preparation of privacy notices in accordance with the Federal Data Protection Law.',
            // Category 4 — Inmobiliario
            inmob_title: 'Real Estate Law',
            inmob_intro: 'Legal certainty in every real estate transaction. Comprehensive advisory for buyers, sellers, national and foreign investors in the acquisition, regularization and defense of real property in Mexico.',
            svc_duediligence_title: 'Preventive & Transactional Advisory',
            svc_duediligence_desc: 'Real estate due diligence, title review and specialized contracts for purchase, promise, exchange, donation and trusts.',
            svc_extranjeros_title: 'Services for Foreigners & Restricted Zones',
            svc_extranjeros_desc: 'Restricted zone trusts, incorporation of Mexican companies with foreign admission clause for real estate investment.',
            svc_litigioinmob_title: 'Legal Defense & Real Estate Litigation',
            svc_litigioinmob_desc: 'Revindicatory actions, adverse possession, lease disputes and amparo against government actions in real estate matters.',
            badge_legal: 'Legal Service',
            btn_more_info: 'More Information',
            // Category 5 — Edictos
            tab_edictos: 'Legal Notices',
            edictos_title: 'Legal Notice (Edicto) Publication in Quintana Roo &amp; Yucatán',
            edictos_intro: 'We publish judicial, probate, foreclosure, notarial and corporate legal notices in a newspaper of state-wide circulation in Quintana Roo and Yucatán. We check the text against the court order, control the dates and the intervals between publications, and deliver the original issues in which your notice appears. Publications for proceedings filed in Cancún, Chetumal, Playa del Carmen, Cozumel, Tulum, Mérida, Valladolid, Progreso and the rest of both states.',
            svc_edictos_judiciales_title: 'Judicial Notices &amp; Service by Publication',
            svc_edictos_judiciales_desc: 'Service by publication on defendants of unknown identity or address, foreclosure and auction notices, adverse possession, title confirmation and civil registry corrections. We control frequency and deadlines.',
            svc_edictos_sucesorios_title: 'Probate Notices &amp; Notarial Announcements',
            svc_edictos_sucesorios_desc: 'Calls to heirs and creditors in testate and intestate succession proceedings, plus notarial succession announcements, published in a newspaper of state-wide circulation.',
            svc_edictos_corporativos_title: 'Corporate Calls &amp; Publications',
            svc_edictos_corporativos_desc: 'Shareholder meeting calls, final liquidation balance sheets, mergers, spin-offs and capital reductions under the General Law of Commercial Companies.',
            // Consulta CTA
            consulta_title: 'Personalized Consultation',
            consulta_desc: 'A 60-minute session where we analyze your case and define the best legal strategy for your project or business.',
            consulta_btn: 'Book Consultation',
            // About
            about_tag: 'About Us',
            about_heading: 'Your strategic <span class="text-gold">legal</span> partner',
            about_p1: 'At <strong>Empírica Legal Lab</strong> we combine legal expertise with a fresh and innovative approach to support entrepreneurs and companies at every stage of their growth.',
            about_p2: 'We believe the law should be an accessible, clear and powerful tool to drive your projects. We\'re not your typical law firm — we\'re your legal lab.',
            stat_services: 'Legal services', stat_digital: 'Digital focus', stat_response: 'Response time',
            // Reviews
            reviews_tag: 'Client Reviews', reviews_heading: 'What they say on <span class="text-gold">Google</span>',
            reviews_sub: 'Our clients\' trust is our greatest endorsement',
            // CTA
            cta_heading: 'Book Your Personalized Consultation',
            cta_desc: 'Reserve a 60-minute session and let\'s build something amazing together. We analyze your case, answer your questions and define the ideal legal strategy for your project.',
            cta_btn: 'Book via WhatsApp', cta_note: 'Response within 24 hours',
            // Newsletter
            news_tag: 'Stay informed', news_heading: 'Subscribe for tips and promotions',
            news_desc: 'Let\'s grow your business. Receive exclusive advice, legal tips and everything you need to know straight to your inbox.',
            // Contact
            contact_tag: 'Let\'s Talk', contact_heading: 'Contact', contact_sub: 'Have questions? We\'re here to help',
            // Footer
            footer_nav: 'Navigation', footer_areas: 'Practice Areas', footer_follow: 'Follow Us',
            footer_inmobiliario: 'Real Estate Law',
            footer_edictos: 'Legal Notices in Quintana Roo &amp; Yucatán',
            // WhatsApp
            wa_tooltip: 'Questions? Write to us'
        }
    };

    var currentLang = 'es';

    function initLanguageToggle() {
        var btn = document.getElementById('lang-toggle');
        if (!btn) return;

        // Restore saved language
        var saved = localStorage.getItem('empirica_lang');
        if (saved === 'en') {
            currentLang = 'en';
            applyTranslations('en');
            btn.textContent = 'ES';
            document.documentElement.lang = 'en';
        }

        btn.addEventListener('click', function () {
            if (currentLang === 'es') {
                currentLang = 'en';
                applyTranslations('en');
                btn.textContent = 'ES';
                document.documentElement.lang = 'en';
            } else {
                currentLang = 'es';
                applyTranslations('es');
                btn.textContent = 'EN';
                document.documentElement.lang = 'es';
            }
            localStorage.setItem('empirica_lang', currentLang);
        });
    }

    function applyTranslations(lang) {
        var elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (lang === 'es') {
                // Restore original Spanish text
                var original = el.getAttribute('data-i18n-es');
                if (original) el.innerHTML = original;
            } else {
                // Save original Spanish text if not saved yet
                if (!el.getAttribute('data-i18n-es')) {
                    el.setAttribute('data-i18n-es', el.innerHTML);
                }
                if (TRANSLATIONS.en[key]) {
                    el.innerHTML = TRANSLATIONS.en[key];
                }
            }
        });
    }

    function renderReviews(data) {
        var grid = document.getElementById('reviews-grid');
        var scoreEl = document.getElementById('reviews-score');
        var starsEl = document.getElementById('reviews-stars');
        var countEl = document.getElementById('reviews-count');

        if (!grid) return;

        // Update summary
        if (data.rating && scoreEl) {
            scoreEl.textContent = data.rating.toFixed(1);
        }
        if (data.total && countEl) {
            countEl.textContent = data.total + ' opiniones en Google';
        }
        if (data.rating && starsEl) {
            var starsHtml = '';
            for (var i = 1; i <= 5; i++) {
                if (i <= Math.floor(data.rating)) {
                    starsHtml += '<i class="fas fa-star"></i>';
                } else if (i - data.rating < 1) {
                    starsHtml += '<i class="fas fa-star-half-alt"></i>';
                } else {
                    starsHtml += '<i class="far fa-star"></i>';
                }
            }
            starsEl.innerHTML = starsHtml;
        }

        // Render review cards
        grid.innerHTML = '';
        data.reviews.forEach(function (review) {
            var initial = review.author ? review.author.charAt(0).toUpperCase() : 'U';
            var starCount = review.rating || 5;
            var starsHtml = '';
            for (var i = 0; i < starCount; i++) {
                starsHtml += '<i class="fas fa-star"></i>';
            }

            var card = document.createElement('div');
            card.className = 'review-card';
            card.innerHTML =
                '<div class="review-header">' +
                    '<div class="review-avatar">' + initial + '</div>' +
                    '<div class="review-meta">' +
                        '<span class="review-author">' + (review.author || 'Usuario') + '</span>' +
                        '<div class="review-stars">' + starsHtml + '</div>' +
                    '</div>' +
                    '<span class="review-date">' + (review.date || '') + '</span>' +
                '</div>' +
                '<p class="review-text">' + (review.text || '') + '</p>' +
                '<div class="review-source"><i class="fab fa-google"></i> Google</div>';
            grid.appendChild(card);
        });
    }

})();
