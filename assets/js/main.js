(() => {
    document.documentElement.classList.remove('no-js');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Nav state + scroll progress ---------- */
    const nav = document.getElementById('nav');
    const progress = document.querySelector('.scroll-progress');
    const onScroll = () => {
        const y = window.scrollY;
        nav.classList.toggle('scrolled', y > 20);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Mobile menu ---------- */
    const burger = document.getElementById('burger');
    const links = document.getElementById('navLinks');
    const setMenu = (open) => {
        links.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', String(open));
    };
    burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
    links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

    /* ---------- Active nav link ---------- */
    const navAnchors = [...links.querySelectorAll('a[href^="#"]')];
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navAnchors.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));

    /* ---------- Reveal on scroll (with stagger) ---------- */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in');
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach((el) => {
        const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
        el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 80}ms`;
        revealObserver.observe(el);
    });

    /* ---------- Typed role ---------- */
    const typed = document.getElementById('typed');
    const roles = [
        'Ingénieur Firmware / Logiciel Embarqué',
        'C · STM32 · ARM Cortex-M',
        'Bare metal & FreeRTOS',
        'Débogage sur cible',
        'UART · SPI · I²C · BLE',
    ];
    if (typed && !reduceMotion) {
        let r = 0, i = roles[0].length, deleting = true;
        const tick = () => {
            const word = roles[r];
            i += deleting ? -1 : 1;
            typed.textContent = word.slice(0, i);
            let delay = deleting ? 35 : 70;
            if (!deleting && i === word.length) { deleting = true; delay = 2200; }
            else if (deleting && i === 0) { deleting = false; r = (r + 1) % roles.length; delay = 350; }
            setTimeout(tick, delay);
        };
        setTimeout(tick, 2600);
    }

    /* ---------- Spotlight cards ---------- */
    document.querySelectorAll('.spot').forEach((card) => {
        card.addEventListener('pointermove', (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
    });

    /* ---------- Project filters ---------- */
    const filters = document.querySelectorAll('.filter');
    const cards = document.querySelectorAll('.project-card');
    filters.forEach((btn) => btn.addEventListener('click', () => {
        filters.forEach((b) => b.classList.toggle('active', b === btn));
        const f = btn.dataset.filter;
        cards.forEach((card) => {
            const show = f === 'all' || card.dataset.cat === f;
            card.classList.toggle('hide', !show);
            if (show) card.classList.add('in');
        });
    }));

    /* ---------- Inline phone video: play when visible ---------- */
    const phoneVideo = document.querySelector('.phone video');
    if (phoneVideo && !reduceMotion) {
        new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) phoneVideo.play().catch(() => {});
            else phoneVideo.pause();
        }, { threshold: 0.4 }).observe(phoneVideo);
    }

    /* ---------- Video modal ---------- */
    const modal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    const openModal = (src, poster) => {
        modalVideo.src = src;
        modalVideo.poster = poster || '';
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        modalVideo.play().catch(() => {});
    };
    const closeModal = () => {
        modalVideo.pause();
        modalVideo.removeAttribute('src');
        modalVideo.load();
        modal.hidden = true;
        document.body.style.overflow = '';
    };
    document.querySelectorAll('.play-btn').forEach((btn) =>
        btn.addEventListener('click', () => openModal(btn.dataset.video, btn.dataset.poster)));
    document.querySelector('.phone')?.addEventListener('click', () => {
        const btn = document.querySelector('.play-btn');
        openModal(btn.dataset.video, btn.dataset.poster);
    });
    modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!modal.hidden) closeModal();
            setMenu(false);
        }
    });

    /* ---------- Copy email ---------- */
    const copyBtn = document.getElementById('copyEmail');
    copyBtn?.addEventListener('click', async () => {
        const label = copyBtn.querySelector('.copy-label');
        try {
            await navigator.clipboard.writeText(copyBtn.dataset.email);
            label.textContent = 'Copié ✓';
        } catch {
            window.location.href = `mailto:${copyBtn.dataset.email}`;
            return;
        }
        copyBtn.classList.add('copied');
        setTimeout(() => { copyBtn.classList.remove('copied'); label.textContent = 'Copier'; }, 2000);
    });

    /* ---------- Footer year ---------- */
    document.getElementById('year').textContent = new Date().getFullYear();
})();
