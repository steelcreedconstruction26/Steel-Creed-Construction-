(() => {
  document.body.classList.remove('no-js');
  const header = document.querySelector('.header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  if (nav && toggle) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
  } else els.forEach(el => el.classList.add('is-in'));

  const form = document.getElementById('estimate-form');
  if (!form) return;
  const params = new URLSearchParams(location.search);
  const pre = params.get('service');
  if (pre) { const opt = [...form.service.options].find(o => o.text.toLowerCase().includes(pre.toLowerCase())); if (opt) form.service.value = opt.value || opt.text; }
  const err = form.querySelector('.form__error');
  const ok = form.querySelector('.form__success');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const req = ['name', 'phone', 'email', 'address', 'service'];
    let bad = null;
    req.forEach(n => {
      const f = form.elements[n];
      const invalid = !f.value.trim() || (n === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.setAttribute('aria-invalid', invalid ? 'true' : 'false');
      if (invalid && !bad) bad = f;
    });
    if (bad) { err.hidden = false; ok.hidden = true; bad.focus(); return; }
    err.hidden = true;
    const d = Object.fromEntries(new FormData(form));
    const body = [
      `Name: ${d.name}`, `Phone: ${d.phone}`, `Email: ${d.email}`, `Property: ${d.address}`,
      `Customer type: ${d.customer}`, `Service: ${d.service}`, `Timeline: ${d.timeline}`, '', `Details: ${d.message || '-'}`
    ].join('\n');
    const subject = `Estimate request: ${d.service} - ${d.name}`;
    ok.hidden = false;
    window.location.href = `mailto:steelcreedconstruction@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  form.querySelectorAll('input,select').forEach(f => f.addEventListener('input', () => f.removeAttribute('aria-invalid')));
})();
