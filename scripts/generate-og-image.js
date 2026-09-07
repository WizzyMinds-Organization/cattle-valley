// Regenerates public/og-image.png (1200x630 social share card).
// Run from the project root:  node scripts/generate-og-image.js
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const W = 1200, H = 630, CX = W / 2;

(async () => {
  const base = await sharp(path.join(ROOT, 'public/images/hero.webp'))
    .resize(W, H, { fit: 'cover', position: 'centre' })
    .toBuffer();

  const scrim = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0"    stop-color="#0b281a" stop-opacity="0.86"/>
        <stop offset="0.42" stop-color="#0b281a" stop-opacity="0.42"/>
        <stop offset="0.62" stop-color="#0b281a" stop-opacity="0.42"/>
        <stop offset="1"    stop-color="#0b281a" stop-opacity="0.92"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="#0b281a" fill-opacity="0.34"/>
    <rect width="${W}" height="${H}" fill="url(#v)"/>
  </svg>`);

  const text = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .eyebrow { font-family:'Plus Jakarta Sans'; font-weight:800; font-size:25px; letter-spacing:5px; fill:#e8c968; }
      .head { font-family:'Plus Jakarta Sans'; font-weight:700; font-size:92px; letter-spacing:-3px; fill:#ffffff; }
    </style>
    <text x="${CX}" y="360" text-anchor="middle" class="head">Sustainable livestock.</text>
    <text x="${CX}" y="458" text-anchor="middle" class="head">Powered by science.</text>
    <text x="${CX}" y="566" text-anchor="middle" class="eyebrow">HEALTHY LIVING HABITAT</text>
  </svg>`);

  const logoSize = 156;
  const logo = await sharp(path.join(ROOT, 'public/images/cattle-valley-logo-light-bg.svg'), { density: 400 })
    .resize(logoSize, logoSize)
    .toBuffer();

  const badgeCy = 120;
  const badge = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${CX}" cy="${badgeCy}" r="${logoSize / 2 + 16}" fill="#ffffff" fill-opacity="0.97"/>
  </svg>`);

  await sharp(base)
    .composite([
      { input: scrim, top: 0, left: 0 },
      { input: badge, top: 0, left: 0 },
      { input: logo, top: Math.round(badgeCy - logoSize / 2), left: Math.round(CX - logoSize / 2) },
      { input: text, top: 0, left: 0 },
    ])
    .png()
    .toFile(path.join(ROOT, 'public/og-image.png'));

  console.log('Wrote public/og-image.png');
})();
