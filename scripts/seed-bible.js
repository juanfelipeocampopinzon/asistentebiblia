const { spawnSync } = require('child_process');
const path = require('path');

const { CREDENTIALS_PATH, PROJECT_ID } = require('./cloud-utils');

const backendDir = path.resolve(__dirname, '..', 'backend');

const result = spawnSync(
  process.execPath,
  [
    '-e',
    "const RealDate=Date; const offset=80*60*1000; global.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[RealDate.now()+offset]))} static now(){return RealDate.now()+offset} static parse=RealDate.parse; static UTC=RealDate.UTC}; require('./seed');"
  ],
  {
    cwd: backendDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      GOOGLE_APPLICATION_CREDENTIALS: CREDENTIALS_PATH,
      PROJECT_ID,
      GOOGLE_CLOUD_PROJECT: PROJECT_ID,
      SEED_ONLY: '1'
    }
  }
);

if (result.status !== 0) {
  console.log('\nSi aparece NOT_FOUND, crea la base Firestore (default) en modo Native.');
  console.log(`Consola: https://console.cloud.google.com/firestore/databases?project=${PROJECT_ID}`);
  console.log('Si aparece PERMISSION_DENIED, la service account necesita permiso para administrar Firestore.');
}

process.exit(result.status || 0);
