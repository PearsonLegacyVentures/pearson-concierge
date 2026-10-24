(() => {
  'use strict';
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const form = document.querySelector('#enquiry-form');
  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
  if (menuButton && mobileNav) {
    function closeMenu() { menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Open navigation'); mobileNav.hidden = true; }
    menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded',String(open)); menuButton.setAttribute('aria-label', open?'Close navigation':'Open navigation'); mobileNav.hidden = !open; });
    mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click',closeMenu));
    document.addEventListener('keydown',event => { if(event.key==='Escape') closeMenu(); });
  }
  if (!form) return;
  const serviceField = form.querySelector('#service');
  const status = document.querySelector('.form-status');
  const fallback = document.querySelector('.request-fallback');
  const submit = form.querySelector('[type="submit"]');
  const copyButton = document.querySelector('.copy-request');
  const requestedService = new URLSearchParams(window.location.search).get('service');
  if(requestedService && [...serviceField.options].some(option => option.value === requestedService)) serviceField.value=requestedService;

  document.querySelectorAll('a[data-service]').forEach(link => link.addEventListener('click', () => {
    serviceField.value = link.dataset.service;
    fallback.hidden = true;
    status.textContent = '';
  }));

  function formPayload() {
    const formData = new FormData(form);
    const fields = ['fullName', 'email', 'phone', 'service', 'date', 'location', 'details', 'website'];
    return Object.fromEntries(fields.map(field => [field, String(formData.get(field) || '').trim()]));
  }
  function asPlainText(payload) {
    return ['PEARSON CONCIERGE REQUEST', '', `Name: ${payload.fullName}`, `Email: ${payload.email}`, `Phone: ${payload.phone || 'Not provided'}`, `Service: ${payload.service}`, `Preferred date: ${payload.date || 'Flexible'}`, `Location: ${payload.location || 'Not provided'}`, '', payload.details].join('\n');
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    fallback.hidden = true;
    status.classList.remove('error');
    status.textContent = '';
    if (!form.reportValidity()) { status.classList.add('error'); status.textContent = 'Please complete the required fields.'; return; }
    const payload = formPayload();
    submit.disabled = true;
    submit.firstChild.textContent = 'Sending request ';
    try {
      const response = await fetch('/api/inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'same-origin' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Request service unavailable.');
      status.textContent = 'Your request has been sent. Thank you. We will contact you using the details provided.';
      form.reset();
    } catch (err) {
      status.classList.add('error');
      status.textContent = 'We could not send your request. No booking has been made.';
      fallback.hidden = false;
    } finally {
      submit.disabled = false;
      submit.firstChild.textContent = 'Send my request ';
    }
  });
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(asPlainText(formPayload()));
      copyButton.textContent = 'Copied — share with our team';
    } catch {
      const details = asPlainText(formPayload());
      const textarea = document.createElement('textarea');
      textarea.value = details;
      textarea.style.position = 'fixed'; textarea.style.opacity = '0';
      document.body.append(textarea); textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      copyButton.textContent = copied ? 'Copied — share with our team' : 'Copy unavailable — please select and copy your details';
    }
  });
})();
