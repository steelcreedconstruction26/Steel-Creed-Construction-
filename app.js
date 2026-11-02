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
  const ENDPOINT = 'https://formsubmit.co/ajax/steelcreedconstruction@gmail.com';
  const params = new URLSearchParams(location.search);
  const commercialBox = form.querySelector('.form__commercial');
  const syncCustomer = () => {
    const v = form.customer.value;
    commercialBox.hidden = !(v.startsWith('Commercial') || v.startsWith('General'));
  };
  if (params.get('type') === 'commercial') {
    form.customer.value = 'Commercial property owner / manager';
    if (!params.get('service')) form.service.value = 'Commercial / flat roofing';
  }
  const pre = params.get('service');
  if (pre) { const opt = [...form.service.options].find(o => o.text.toLowerCase().includes(pre.toLowerCase())); if (opt) form.service.value = opt.value || opt.text; }
  form.customer.addEventListener('change', syncCustomer); syncCustomer();

  const need = () => (form.preferred_contact.value === 'Email' ? 'email' : 'phone');
  const syncContact = () => {
    const n = need();
    ['phone', 'email'].forEach(k => {
      form.querySelector(`[data-req="${k}"]`).hidden = k !== n;
      form.querySelector(`[data-opt="${k}"]`).hidden = k === n;
      form.elements[k].required = k === n;
    });
  };
  form.querySelectorAll('input[name="preferred_contact"]').forEach(r => r.addEventListener('change', syncContact)); syncContact();

  const err = form.querySelector('.form__error');
  const ok = form.querySelector('.form__success');
  const btn = form.querySelector('button[type="submit"]');
  const fallback = 'call <a href="tel:+17735194135">773-519-4135</a> or email <a href="mailto:steelcreedconstruction@gmail.com">steelcreedconstruction@gmail.com</a>.';
  const showErr = html => { err.innerHTML = html; err.hidden = false; };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const n = need();
    const checks = [
      ['name', v => v.trim(), 'your name'],
      ['address', v => v.trim(), 'the property address or town'],
      [n, v => n === 'email' ? /^\S+@\S+\.\S+$/.test(v) : v.replace(/\D/g, '').length >= 10, n === 'email' ? 'a valid email' : 'a phone number with area code'],
      ['service', v => v, 'the service you need'],
    ];
    if (n === 'phone' && form.email.value && !/^\S+@\S+\.\S+$/.test(form.email.value)) checks.push(['email', () => false, 'a valid email (or leave it blank)']);
    const missing = []; let first = null;
    ['name','address','phone','email','service'].forEach(k => form.elements[k].removeAttribute('aria-invalid'));
    checks.forEach(([k, test, label]) => { const f = form.elements[k]; if (!test(f.value)) { f.setAttribute('aria-invalid', 'true'); missing.push(label); first = first || f; } });
    const file = form.attachment.files[0];
    if (file && file.size > 5 * 1024 * 1024) { form.attachment.setAttribute('aria-invalid', 'true'); missing.push('a file under 5 MB'); first = first || form.attachment; }
    if (missing.length) { showErr('Please add ' + missing.join(', ') + '.'); ok.hidden = true; first.focus(); return; }
    err.hidden = true;
    const data = new FormData(form);
    if (form.email.value) data.set('_replyto', form.email.value);
    data.set('_subject', `Estimate request: ${form.service.value} - ${form.elements['name'].value.trim()}`);
    if (!file) data.delete('attachment');
    btn.disabled = true; const label = btn.textContent; btn.textContent = 'Sending...';
    try {
      const res = await fetch(ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) === 'false') throw new Error(json.message || 'send failed');
      [...form.children].forEach(c => { if (c !== ok) c.hidden = true; });
      ok.hidden = false; ok.focus();
    } catch (x) {
      showErr("Sorry, your request didn't go through. Please try again, or " + fallback);
      btn.disabled = false; btn.textContent = label;
    }
  });
  form.querySelectorAll('input,select,textarea').forEach(f => f.addEventListener('input', () => f.removeAttribute('aria-invalid')));
})();
