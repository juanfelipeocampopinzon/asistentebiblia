const os = require('os');
const path = require('path');

const {
  PROJECT_ID,
  getAccessToken,
  ensureBuildBucket,
  tarSource,
  uploadSource,
  runCloudBuild,
  deployCloudRun,
  makeServicePublic
} = require('./cloud-utils');

async function main() {
  const token = await getAccessToken();
  const serviceName = 'biblia-frontend';
  const image = `gcr.io/${PROJECT_ID}/${serviceName}:latest`;
  const objectName = `${serviceName}-source.tar.gz`;
  const tarPath = path.join(os.tmpdir(), objectName);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://biblia-backend-g3o3xjlp2a-uc.a.run.app';
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_OAUTH_CLIENT_ID || '';

  console.log(`Frontend consumirá backend: ${backendUrl}`);
  console.log('Empaquetando frontend...');
  tarSource({
    output: tarPath,
    cwd: path.resolve(__dirname, '..'),
    excludes: [
      'node_modules',
      '.next',
      'backend',
      'backend/node_modules',
      'backend/microservicio-471115-754b0a449188.json',
      '*.log'
    ]
  });

  console.log('Preparando Cloud Storage...');
  await ensureBuildBucket(token);
  await uploadSource({ token, tarPath, objectName });

  console.log('Construyendo imagen frontend...');
  const build = await runCloudBuild({
    token,
    objectName,
    image,
    buildArgs: [
      '--build-arg',
      `NEXT_PUBLIC_BACKEND_URL=${backendUrl}`,
      '--build-arg',
      `NEXT_PUBLIC_GOOGLE_CLIENT_ID=${googleClientId}`
    ]
  });

  console.log('Desplegando frontend en Cloud Run...');
  const url = await deployCloudRun({
    token,
    serviceName,
    image,
    env: {
      NEXT_PUBLIC_BACKEND_URL: backendUrl,
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: googleClientId
    }
  });

  const publicResponse = await makeServicePublic({ token, serviceName });
  const isPublic = publicResponse.status < 300;

  console.log(JSON.stringify({
    serviceName,
    url,
    backendUrl,
    googleClientIdConfigured: Boolean(googleClientId),
    image,
    buildId: build.id,
    logUrl: build.logUrl,
    public: isPublic,
    publicPermissionStatus: publicResponse.status
  }, null, 2));

  if (!isPublic) {
    console.log('El frontend quedó desplegado, pero privado. Falta permiso run.services.setIamPolicy para hacerlo público.');
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
