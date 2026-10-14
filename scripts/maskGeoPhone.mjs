import fs from 'fs';

const filePath = 'src/data/geoTalentData.ts';
let code = fs.readFileSync(filePath, 'utf8');

const target = "whatsapp: creator['Kontak WhatsApp'] || null";
const replacement = "whatsapp: creator['Kontak WhatsApp'] ? (String(creator['Kontak WhatsApp']).replace(/\\D/g, '').slice(0, 4) + '****' + String(creator['Kontak WhatsApp']).replace(/\\D/g, '').slice(-3)) : null";

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Successfully masked WhatsApp in geoTalentData.ts');
} else {
  console.log('Target string not found in geoTalentData.ts');
}
