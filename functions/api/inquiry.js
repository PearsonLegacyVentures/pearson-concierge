/** Cloudflare Pages Function. Requires RESEND_API_KEY, LEAD_TO_EMAIL and LEAD_FROM_EMAIL. */
const SERVICES = new Set([
  'Yachts & island experiences',
  'In-villa & yacht wellness',
  'Private chefs & dining',
  'VIP transfers & chauffeurs',
  'Villa provisioning & arrival preparation',
  'Something else',
]);
const FIELDS = { fullName: 120, email: 254, phone: 40, service: 60, date: 10, location: 120, details: 3000, website: 200 };
const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const reply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });

export function validateInquiry(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Invalid request.' };
  const data = {};
  for (const [key, maxLength] of Object.entries(FIELDS)) {
    if (input[key] !== undefined && typeof input[key] !== 'string') return { error: 'Invalid field format.' };
    const value = String(input[key] ?? '').trim();
    if (value.length > maxLength) return { error: 'A field is too long.' };
    data[key] = value;
  }
  if (data.website) return { spam: true };
  if (data.fullName.length < 2 || data.details.length < 10 || !SERVICES.has(data.service)) return { error: 'Please provide your name, service and request details.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) return { error: 'Please provide a valid email address.' };
  if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) return { error: 'Invalid date.' };
  if (data.date && Number.isNaN(Date.parse(`${data.date}T00:00:00Z`))) return { error: 'Invalid date.' };
  return { data };
}

export function emailBody(data) {
  return [
    'New Pearson Concierge enquiry',
    '',
    `Name: ${data.fullName}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || 'Not provided'}`,
    `Service: ${data.service}`,
    `Date: ${data.date || 'Flexible'}`,
    `Location: ${data.location || 'Not specified'}`,
    '',
    'Request:', data.details, '',
    'Please verify availability and confirm pricing directly. This is not a confirmed booking.',
  ].join('\n');
}

export async function onRequestPost({ request, env }) {
  if (request.headers.get('Content-Type')?.split(';')[0]?.trim().toLowerCase() !== 'application/json') return reply({ error: 'Use JSON.' }, 415);
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return reply({ error: 'Invalid origin.' }, 403);
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > 8500) return reply({ error: 'Request too large.' }, 413);
  let body;
  try { const raw = await request.text(); if (raw.length > 8500) return reply({ error: 'Request too large.' }, 413); body = JSON.parse(raw); }
  catch { return reply({ error: 'Invalid request.' }, 400); }
  const checked = validateInquiry(body);
  if (checked.spam) return reply({ ok: true }); // do not reveal honeypot to bots
  if (checked.error) return reply({ error: checked.error }, 400);
  if (!env?.RESEND_API_KEY || !env?.LEAD_TO_EMAIL || !env?.LEAD_FROM_EMAIL) return reply({ error: 'Online requests are not yet enabled. Please try again later.' }, 503);
  const data = checked.data;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.LEAD_FROM_EMAIL,
        to: [env.LEAD_TO_EMAIL],
        reply_to: data.email,
        subject: `Pearson Concierge enquiry — ${data.service}`,
        text: emailBody(data),
      }),
    });
    if (!response.ok) {
      console.error('Email provider rejected an enquiry', response.status);
      return reply({ error: 'Request sending is temporarily unavailable.' }, 502);
    }
    return reply({ ok: true });
  } catch (error) {
    console.error('Enquiry delivery failed', error?.message);
    return reply({ error: 'Request sending is temporarily unavailable.' }, 502);
  }
}

export function onRequestGet() { return reply({ error: 'Method not allowed.' }, 405); }
