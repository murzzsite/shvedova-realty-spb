(() => {
  const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/NYGYDKWQ4R';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const y = $('#year'); if (y) y.textContent = '© ' + new Date().getFullYear();

  // header
  const header = $('#header');
  const burger = $('#burger'), nav = $('#nav');
  burger?.addEventListener('click', () => {
    const o = burger.classList.toggle('is-open');
    nav.classList.toggle('is-open', o);
    burger.setAttribute('aria-expanded', o);
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('is-open'); nav.classList.remove('is-open');
  }));

  // smooth anchors
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const h = a.getAttribute('href'); if (h.length < 2) return;
    const t = $(h); if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 68, behavior: reduce ? 'auto' : 'smooth' });
  }));

  // split headline into words
  $$('[data-split]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true" style="--wi:${i}"><span>${w}</span></span>`).join(' ');
  });

  // reveal (rAF check on scroll)
  const rev = $$('[data-r],[data-split]');
  const checkReveal = () => {
    const vh = innerHeight;
    rev.forEach(el => {
      if (el.classList.contains('is-in')) return;
      if (el.getBoundingClientRect().top < vh * 0.94) el.classList.add('is-in');
    });
  };

  // parallax on images
  const par = $$('[data-parallax]');
  const doPar = () => {
    if (reduce) return;
    const vh = innerHeight;
    par.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const p = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.transform = `translateY(${(p * -6).toFixed(2)}%) scale(1.14)`;
    });
  };

  // facade scene
  const facade = $('#facade');
  const scene = $('#checks');
  const COLS = 12, ROWS = 9, N = COLS * ROWS;
  let wins = [], rank = [], pickIdx = 3 * COLS + 8;
  if (facade) {
    for (let i = 0; i < N; i++) { const d = document.createElement('div'); d.className = 'win'; facade.appendChild(d); wins.push(d); }
    let s = 20261106; const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    const order = [...Array(N).keys()].filter(i => i !== pickIdx);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    rank = Array(N); rank[pickIdx] = 0; order.forEach((idx, k) => rank[idx] = k + 1);
  }
  const checks = $$('.check');
  const counter = $('#counter'), counterT = $('#counter-t');
  let lastN = -1, lastA = -1;
  const doScene = () => {
    if (!facade || !scene || !document.documentElement.classList.contains('js')) return;
    const r = scene.getBoundingClientRect();
    const total = r.height - innerHeight;
    if (total <= 0) return;
    const p = Math.min(1, Math.max(0, -r.top / total));
    const e = Math.min(1, p * 1.08);
    const n = Math.max(1, Math.round(Math.pow(N, 1 - e)));
    const a = Math.min(checks.length - 1, Math.floor(p * checks.length));
    if (n !== lastN) {
      wins.forEach((w, i) => {
        w.classList.toggle('is-off', rank[i] >= n);
        w.classList.toggle('is-pick', i === pickIdx && n <= 3);
        w.classList.toggle('is-final', i === pickIdx && n === 1);
      });
      counter.textContent = n;
      counterT.textContent = n === 1 ? 'окно: ваше' : (n === N ? 'вариантов в начале' : 'вариантов осталось');
      lastN = n;
    }
    if (a !== lastA) { checks.forEach((c, i) => c.classList.toggle('is-active', i === a)); lastA = a; }
  };

  let ticking = false;
  const onScroll = () => {
    header?.classList.toggle('scrolled', scrollY > 8);
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { checkReveal(); doPar(); doScene(); ticking = false; });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll(); setTimeout(onScroll, 300);

  // calculator
  const calc = $('#calc');
  if (calc) {
    const input = $('#calc-input'), priceEl = $('#calc-price'), sumEl = $('#calc-sum'),
      lbl = $('#calc-lbl'), note = $('#calc-note'), wrap = $('#calc-range-wrap');
    let mode = 'buy', shown = 750000, raf;
    const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽';
    const tween = to => {
      cancelAnimationFrame(raf);
      const from = shown, t0 = performance.now();
      const step = t => {
        const k = Math.min(1, (t - t0) / 500), v = from + (to - from) * (1 - Math.pow(1 - k, 3));
        sumEl.textContent = (mode === 'mort' ? 'от ' : '') + fmt(v); shown = v;
        if (k < 1) raf = requestAnimationFrame(step);
      };
      reduce ? (shown = to, sumEl.textContent = (mode === 'mort' ? 'от ' : '') + fmt(to)) : raf = requestAnimationFrame(step);
    };
    const update = () => {
      const price = parseFloat(input.value);
      priceEl.textContent = price.toString().replace('.', ',') + ' млн ₽';
      if (mode === 'buy' || mode === 'sell') {
        lbl.textContent = 'Стоимость услуги';
        note.textContent = '3 % от цены квартиры. Платите по итогам сделки.';
        wrap.hidden = false; tween(price * 1e6 * 0.03);
      } else if (mode === 'new') {
        lbl.textContent = 'Для вас';
        note.textContent = 'Подбор новостройки бесплатный. Вознаграждение платит застройщик.';
        wrap.hidden = true; tween(0);
      } else {
        lbl.textContent = 'Одобрение ипотеки';
        note.textContent = 'Стоимость зависит от задачи, называем точно на консультации.';
        wrap.hidden = true; tween(10000);
      }
    };
    $$('.calc__tabs button').forEach(b => b.addEventListener('click', () => {
      $$('.calc__tabs button').forEach(x => { x.classList.remove('is-on'); x.setAttribute('aria-selected', 'false'); });
      b.classList.add('is-on'); b.setAttribute('aria-selected', 'true');
      mode = b.dataset.mode; update();
    }));
    input.addEventListener('input', update);
    update();
  }

  // form
  const form = $('#leadForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]'), orig = btn.textContent;
    const payload = {}; new FormData(form).forEach((v, k) => payload[k] = v);
    if (payload._gotcha) return;
    let bad = false;
    ['name', 'contact'].forEach(k => {
      const f = form.elements[k]; const ok = (payload[k] || '').trim().length >= (k === 'name' ? 2 : 5);
      f.classList.toggle('bad', !ok); if (!ok) bad = true;
    });
    if (bad) return;
    payload.comment = `Задача: ${payload.goal}; бюджет: ${payload.budget}; срок: ${payload.term}`;
    payload.source = 'shvedova-realty-spb';
    btn.disabled = true; btn.textContent = 'Отправляем...';
    try {
      const resp = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      btn.textContent = 'Заявка отправлена';
      form.reset();
    } catch (err) { console.error(err); btn.textContent = 'Ошибка, попробуйте ещё раз'; }
    finally { setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3000); }
  });
})();
