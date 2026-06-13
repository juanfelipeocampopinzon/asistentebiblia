const fs = require('fs');
const path = require('path');

const publisherId = process.env.ADSENSE_PUBLISHER_ID || process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '';
const normalized = publisherId.replace(/^ca-/, '');
const outputPath = path.resolve(__dirname, '..', 'public', 'ads.txt');

if (!normalized) {
  console.log('ADSENSE_PUBLISHER_ID no configurado. No se genero ads.txt.');
  process.exit(0);
}

fs.writeFileSync(outputPath, `google.com, ${normalized}, DIRECT, f08c47fec0942fa0\n`);
console.log(`ads.txt generado en ${outputPath}`);
