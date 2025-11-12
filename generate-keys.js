const jose = require('node-jose');
const fs = require('fs');

async function generate() {
  const keystore = jose.JWK.createKeyStore();
  await keystore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' });
  fs.writeFileSync('keys.json', JSON.stringify(keystore.toJSON(true), null, 2));
  console.log('✅ Claves generadas y guardadas en keys.json');
}

generate();
