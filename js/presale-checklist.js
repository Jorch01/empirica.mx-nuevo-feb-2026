/* ==========================================================
   EMPÍRICA LEGAL LAB — Checklist "Is this presale safe?"
   Cada "No" o "I don't know" suma un punto de riesgo. La pregunta
   del plazo (data-deadline) en "No" lleva directo al nivel alto,
   porque el plazo de un año es el riesgo que el cliente menos conoce.
   El resultado se copia al formulario de contacto para que el
   abogado lo reciba junto con el mensaje.
   ========================================================== */
(function () {
    'use strict';

    var form = document.getElementById('presale-quiz');
    if (!form) return;

    var questions = Array.prototype.slice.call(form.querySelectorAll('.lab-q'));
    var submit = document.getElementById('quiz-submit');
    var progress = document.getElementById('quiz-progress');
    var result = document.getElementById('quiz-result');

    var LEVELS = {
        low: {
            css: 'is-low',
            tag: 'RESULT · LOW RISK',
            title: 'Looks reasonable.',
            text: 'Keep copies of everything. A contract review before your next payment costs far less than a dispute.'
        },
        mid: {
            css: 'is-mid',
            tag: 'RESULT · RED FLAGS',
            title: 'Red flags.',
            text: 'Get a legal review before paying anything else.'
        },
        high: {
            css: 'is-high',
            tag: 'RESULT · ACT NOW',
            title: 'Act now.',
            text: 'Your deadlines may be running. Book a Case Assessment this week.'
        }
    };

    function answered() {
        return questions.filter(function (q) { return q.querySelector('input:checked'); }).length;
    }

    function updateProgress() {
        var n = answered();
        progress.textContent = n + ' / ' + questions.length + ' ANSWERED';
        submit.disabled = n < questions.length;
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function evaluate() {
        var points = 0;
        var deadlineMissed = false;
        var flags = [];
        var lines = [];

        questions.forEach(function (q, i) {
            var input = q.querySelector('input:checked');
            var value = input ? input.value : '';
            var text = q.querySelector('.lab-q-text').textContent.trim();
            var risky = value === 'no' || value === 'unknown';
            if (risky) {
                points++;
                flags.push(q.getAttribute('data-flag') || text);
            }
            if (q.hasAttribute('data-deadline') && value === 'no') deadlineMissed = true;
            lines.push((i + 1) + '. ' + text + ' → ' + (input ? input.parentNode.textContent.trim() : '—'));
        });

        var level = deadlineMissed || points >= 6 ? 'high' : points >= 3 ? 'mid' : 'low';
        return { points: points, level: level, flags: flags, lines: lines, deadlineMissed: deadlineMissed };
    }

    function show(r) {
        var L = LEVELS[r.level];
        result.className = 'lab-result ' + L.css;
        result.querySelector('.lab-result-tag').textContent = L.tag + ' · ' + r.points + ' RISK POINT' + (r.points === 1 ? '' : 'S');
        result.querySelector('h2').textContent = L.title;
        result.querySelector('.lab-result-text').textContent = L.text +
            (r.deadlineMissed ? ' More than a year may have passed since you learned of the problem: some routes may already be closed or about to close.' : '');

        var list = result.querySelector('.lab-result-flags');
        list.innerHTML = r.flags.map(function (f) { return '<li>' + escapeHtml(f) + '</li>'; }).join('');
        list.previousElementSibling.hidden = r.flags.length === 0;
        list.hidden = r.flags.length === 0;

        result.hidden = false;
        result.setAttribute('tabindex', '-1');
        result.focus({ preventScroll: true });
        result.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // El abogado recibe el resultado junto con el mensaje
        var message = document.querySelector('#evaluacion textarea[name="mensaje"]');
        if (message) {
            message.value = 'Presale checklist result: ' + L.title + ' (' + r.points + ' risk points).\n' +
                r.lines.join('\n') + '\n\nMy situation: ';
        }

        if (typeof window.gtag === 'function') {
            window.gtag('event', 'checklist_complete', {
                checklist: 'presale_safety',
                risk_level: r.level,
                risk_points: r.points
            });
        }
    }

    form.addEventListener('change', updateProgress);
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (answered() < questions.length) return;
        show(evaluate());
    });
    form.addEventListener('reset', function () {
        result.hidden = true;
        setTimeout(updateProgress, 0);
    });

    updateProgress();
})();
