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
  const serviceName = 'biblia-backend';
  const image = `gcr.io/${PROJECT_ID}/${serviceName}:latest`;
  const objectName = `${serviceName}-source.tar.gz`;
  const tarPath = path.join(os.tmpdir(), objectName);

  console.log('Empaquetando backend...');
  tarSource({
    output: tarPath,
    cwd: path.resolve(__dirname, '..', 'backend'),
    excludes: ['node_modules', 'microservicio-471115-754b0a449188.json', '*.log']
  });

  console.log('Preparando Cloud Storage...');
  await ensureBuildBucket(token);
  await uploadSource({ token, tarPath, objectName });

  console.log('Construyendo imagen backend...');
  const build = await runCloudBuild({ token, objectName, image });

  console.log('Desplegando backend en Cloud Run...');
  const url = await deployCloudRun({
    token,
    serviceName,
    image,
    env: {
      PROJECT_ID,
      GOOGLE_CLOUD_PROJECT: PROJECT_ID,
      FIRESTORE_DATABASE_ID: '(default)',
      GOOGLE_CLOUD_LOCATION: 'global',
      GEMINI_MODEL: 'gemini-2.5-pro'
    }
  });

  const publicResponse = await makeServicePublic({ token, serviceName });
  const isPublic = publicResponse.status < 300;

  console.log(JSON.stringify({
    serviceName,
    url,
    image,
    buildId: build.id,
    logUrl: build.logUrl,
    public: isPublic,
    publicPermissionStatus: publicResponse.status
  }, null, 2));

  if (!isPublic) {
    console.log('El backend quedó desplegado, pero privado. Falta permiso run.services.setIamPolicy para hacerlo público.');
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
