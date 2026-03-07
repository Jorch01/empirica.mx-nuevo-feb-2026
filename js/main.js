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
