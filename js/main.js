/* ==========================================================
   EMPÍRICA LEGAL LAB — Main JavaScript
   ========================================================== */

(function () {
    'use strict';

    /* ── STRIPE PAYMENT LINKS CONFIG ──
     * Reemplaza los valores con tus Payment Links de Stripe.
     * Para crear Payment Links:
     * 1. Ve a https://dashboard.stripe.com/payment-links
     * 2. Crea un link para cada servicio
     * 3. Pega la URL completa aquí
     */
    const STRIPE_LINKS = {
        STRIPE_LINK_LEGAL_ENGLISH: '',       // https://buy.stripe.com/tu_link_aqui
        STRIPE_LINK_TRANSCRIPCIONES: '',
        STRIPE_LINK_CORRESPONSALIAS: '',
        STRIPE_LINK_LITIGIO: '',
        STRIPE_LINK_PRIVACIDAD: '',
        STRIPE_LINK_CONSULTA: '',
        STRIPE_LINK_MARCA: '',
        STRIPE_LINK_SOCIEDAD: '',
        STRIPE_LINK_DERECHOS: '',
        STRIPE_LINK_CONTRATOS: '',
    };

    /* ── WHATSAPP CONFIG ──
     * Reemplaza con tu número de WhatsApp (con código de país, sin +)
     */
    const WHATSAPP_NUMBER = '521TUNUMERO'; // Ejemplo: 5215512345678

    /* ──────────────────────────────────────────────────
       DOM Ready
       ────────────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function () {
        initNavbar();
        initMobileMenu();
        initStripeLinks();
        initWhatsAppLinks();
        initSubscribeModal();
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

        // Close menu when clicking a link
        var navAnchors = links.querySelectorAll('a');
        navAnchors.forEach(function (anchor) {
            anchor.addEventListener('click', function () {
                links.classList.remove('open');
                toggle.classList.remove('active');
            });
        });

        // Close menu on outside click
        document.addEventListener('click', function (e) {
            if (!links.contains(e.target) && !toggle.contains(e.target)) {
                links.classList.remove('open');
                toggle.classList.remove('active');
            }
        });
    }

    /* ──────────────────────────────────────────────────
       Stripe Payment Links
       ────────────────────────────────────────────────── */
    function initStripeLinks() {
        var buttons = document.querySelectorAll('[data-stripe-link]');
        buttons.forEach(function (btn) {
            var linkKey = btn.getAttribute('data-stripe-link');
            var stripeUrl = STRIPE_LINKS[linkKey];

            if (stripeUrl) {
                btn.href = stripeUrl;
                btn.target = '_blank';
                btn.rel = 'noopener';
            } else {
                // No Stripe link configured - show a friendly message
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    alert(
                        '¡Próximamente!\n\n' +
                        'Este servicio estará disponible para compra en línea muy pronto.\n\n' +
                        'Mientras tanto, contáctanos por WhatsApp o email para contratar este servicio.'
                    );
                });
            }
        });
    }

    /* ──────────────────────────────────────────────────
       WhatsApp Links
       ────────────────────────────────────────────────── */
    function initWhatsAppLinks() {
        var waLinks = document.querySelectorAll('a[href*="wa.me"]');
        waLinks.forEach(function (link) {
            if (WHATSAPP_NUMBER && WHATSAPP_NUMBER !== '521TUNUMERO') {
                link.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' +
                    encodeURIComponent('Hola, me interesa conocer más sobre los servicios de Empírica Legal Lab.');
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
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });
    }

    /* ──────────────────────────────────────────────────
       Forms
       ────────────────────────────────────────────────── */
    function initForms() {
        // Newsletter form
        var newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function (e) {
                e.preventDefault();
                handleFormSubmit(this, 'newsletter');
            });
        }

        // Modal subscribe form
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

        // TODO: Conecta aquí tu backend o servicio de email marketing
        // Ejemplos:
        // - Mailchimp: POST a tu endpoint de Mailchimp
        // - ConvertKit: POST a tu endpoint de ConvertKit
        // - Google Sheets: POST via Google Apps Script
        // - Tu propio backend: POST a tu API

        console.log('Form submitted (' + type + '):', data);

        // Show success message
        var btn = form.querySelector('button[type="submit"]');
        var originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> ¡Suscrito!';
        btn.style.background = '#25D366';
        btn.style.borderColor = '#25D366';
        btn.disabled = true;

        form.reset();

        // Close modal after success (if modal form)
        if (type === 'modal') {
            setTimeout(function () {
                var modal = document.getElementById('subscribe-modal');
                if (modal) modal.classList.remove('active');
            }, 2000);
        }

        // Reset button after delay
        setTimeout(function () {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.disabled = false;
        }, 4000);
    }

    /* ──────────────────────────────────────────────────
       Scroll Animations (Intersection Observer)
       ────────────────────────────────────────────────── */
    function initScrollAnimations() {
        // Animate sections
        var sections = document.querySelectorAll('.section-header, .about-content, .about-visual, .cta-content, .newsletter-inner, .contact-card');
        sections.forEach(function (el) {
            el.classList.add('animate-on-scroll');
        });

        // Animate service cards with stagger
        var serviceCards = document.querySelectorAll('.service-card');

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    // For service cards, add stagger delay
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
