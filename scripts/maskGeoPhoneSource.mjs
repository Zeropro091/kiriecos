import fs from 'fs';

/**
 * S14: mask WhatsApp numbers AT THE SOURCE so raw personal data is never
 * bundled into the frontend. Idempotent — values already masked are skipped.
 * Keep the un-masked originals in an offline/server-only copy if they are
 * still needed for administration.
 */

const mask = (raw) => {
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length < 8) return '0****' + digits.slice(-3);
  return digits.slice(0, 4) + '****' + digits.slice(-3);
};

const looksRaw = (v) => /^\+?0\d{7,15}$/.test(String(v).trim());

// 1) masterGeoCreators.json --------------------------------------------
const jsonPath = 'src/data/masterGeoCreators.json';
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let jsonMasked = 0;
const walk = (node) => {
  if (Array.isArray(node)) {
    node.forEach(walk);
    return;
  }
  if (node && typeof node === 'object') {
    if ('Kontak WhatsApp' in node && looksRaw(node['Kontak WhatsApp'])) {
      node['Kontak WhatsApp'] = mask(node['Kontak WhatsApp']);
      jsonMasked += 1;
    }
    Object.values(node).forEach(walk);
  }
};
walk(data);
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`masterGeoCreators.json: masked ${jsonMasked} raw numbers`);

// 2) geoTalentData.ts (inline baseSampleCreators) ----------------------
const tsPath = 'src/data/geoTalentData.ts';
let code = fs.readFileSync(tsPath, 'utf8');

let tsMasked = 0;
code = code.replace(/"Kontak WhatsApp":\s*"(0\d{7,15})"/g, (_, raw) => {
  tsMasked += 1;
  return `"Kontak WhatsApp": "${mask(raw)}"`;
});
fs.writeFileSync(tsPath, code, 'utf8');
console.log(`geoTalentData.ts: masked ${tsMasked} raw numbers`);

if (jsonMasked + tsMasked === 0) {
  console.log('Nothing to mask (already masked).');
}
