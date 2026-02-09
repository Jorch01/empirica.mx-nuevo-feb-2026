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
    var GOOGLE_SHEET_URL = ''; // https://script.google.com/macros/s/TU_ID/exec

    /* Número de WhatsApp (con código de país, sin +) */
    var WHATSAPP_NUMBER = '529982570828';

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
        }
    };

    /* ──────────────────────────────────────────────────
       DOM Ready
       ────────────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function () {
        initNavbar();
        initMobileMenu();
        initSubscribeModal();
        initServiceModals();
        initForms();
        initScrollAnimations();
        initSmoothScroll();
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
        var sections = document.querySelectorAll('.section-header, .about-content, .about-visual, .cta-content, .newsletter-inner, .contact-card');
        sections.forEach(function (el) {
            el.classList.add('animate-on-scroll');
        });

        var serviceCards = document.querySelectorAll('.service-card');

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('service-card')) {
                        var cards = Array.from(serviceCards);
                        var index = cards.indexOf(entry.target);
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

})();
