const fs = require('fs');
const https = require('https');
const path = require('path');
const { spawnSync } = require('child_process');

const { GoogleAuth } = require('../backend/node_modules/google-auth-library');

const ROOT = path.resolve(__dirname, '..');
const PROJECT_ID = process.env.PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'microservicio-471115';
const REGION = process.env.CLOUD_RUN_REGION || 'us-central1';
const BUILD_BUCKET = process.env.BUILD_BUCKET || `${PROJECT_ID}-build-src`;
const CREDENTIALS_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(ROOT, 'backend', 'microservicio-471115-754b0a449188.json');

function applyClockOffset() {
  const offsetMinutes = Number(process.env.CLOCK_OFFSET_MINUTES || 80);
  if (!offsetMinutes) return;

  const RealDate = Date;
  const offsetMs = offsetMinutes * 60 * 1000;

  global.Date = class extends RealDate {
    constructor(...args) {
      super(...(args.length ? args : [RealDate.now() + offsetMs]));
    }

    static now() {
      return RealDate.now() + offsetMs;
    }

    static parse = RealDate.parse;
    static UTC = RealDate.UTC;
  };
}

function ensureCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(`No encontré credenciales en ${CREDENTIALS_PATH}`);
  }

  process.env.GOOGLE_APPLICATION_CREDENTIALS = CREDENTIALS_PATH;
  process.env.PROJECT_ID = PROJECT_ID;
  process.env.GOOGLE_CLOUD_PROJECT = PROJECT_ID;
}

async function getAccessToken() {
  applyClockOffset();
  ensureCredentials();

  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const client = await auth.getClient();
  return (await client.getAccessToken()).token;
}

async function request({ host, path: requestPath, method = 'GET', token, headers = {}, body }) {
  const payload = body && !Buffer.isBuffer(body) ? JSON.stringify(body) : body;

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: host,
        path: requestPath,
        method,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(payload && !headers['Content-Length'] ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers
        }
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            body: Buffer.concat(chunks).toString()
          });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function ensureBuildBucket(token) {
  const response = await request({
    host: 'storage.googleapis.com',
    path: `/storage/v1/b?project=${PROJECT_ID}`,
    method: 'POST',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: { name: BUILD_BUCKET, location: 'US' }
  });

  if (![200, 409].includes(response.status)) {
    throw new Error(`No pude crear/verificar bucket de build: ${response.body}`);
  }
}

function tarSource({ output, cwd, excludes }) {
  if (fs.existsSync(output)) fs.rmSync(output, { force: true });

  const args = ['-czf', output, ...excludes.flatMap((item) => ['--exclude', item]), '-C', cwd, '.'];
  const result = spawnSync('tar', args, { cwd: ROOT, stdio: 'inherit' });

  if (result.status !== 0) {
    throw new Error(`tar falló creando ${output}`);
  }
}

async function uploadSource({ token, tarPath, objectName }) {
  const file = fs.readFileSync(tarPath);
  const response = await request({
    host: 'storage.googleapis.com',
    path: `/upload/storage/v1/b/${BUILD_BUCKET}/o?uploadType=media&name=${objectName}`,
    method: 'POST',
    token,
    headers: {
      'Content-Type': 'application/gzip',
      'Content-Length': file.length
    },
    body: file
  });

  if (response.status >= 300) {
    throw new Error(`No pude subir source a Cloud Storage: ${response.body}`);
  }
}

async function runCloudBuild({ token, objectName, image, buildArgs = [] }) {
  const build = {
    source: {
      storageSource: {
        bucket: BUILD_BUCKET,
        object: objectName
      }
    },
    steps: [
      {
        name: 'gcr.io/cloud-builders/docker',
        args: ['build', ...buildArgs, '-t', image, '.']
      },
      {
        name: 'gcr.io/cloud-builders/docker',
        args: ['push', image]
      }
    ],
    images: [image]
  };

  const createResponse = await request({
    host: 'cloudbuild.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/builds`,
    method: 'POST',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: build
  });

  if (createResponse.status >= 300) {
    throw new Error(`No pude crear Cloud Build: ${createResponse.body}`);
  }

  const created = JSON.parse(createResponse.body);
  const buildId = created.id || created.metadata?.build?.id;

  if (!buildId) {
    throw new Error(`Cloud Build no devolvio id: ${createResponse.body}`);
  }

  console.log(`Cloud Build creado: ${buildId}`);

  for (let index = 0; index < 120; index++) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const statusResponse = await request({
      host: 'cloudbuild.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/builds/${buildId}`,
      token
    });
    const buildStatus = JSON.parse(statusResponse.body);
    console.log(`Cloud Build status: ${buildStatus.status}`);

    if (['SUCCESS', 'FAILURE', 'INTERNAL_ERROR', 'TIMEOUT', 'CANCELLED', 'EXPIRED'].includes(buildStatus.status)) {
      if (buildStatus.status !== 'SUCCESS') {
        throw new Error(`Cloud Build falló: ${buildStatus.logUrl}`);
      }

      return {
        id: buildId,
        image,
        logUrl: buildStatus.logUrl
      };
    }
  }

  throw new Error('Cloud Build tardó demasiado.');
}

function cloudRunServiceBody({ serviceName, image, env = {} }) {
  const serviceAccount = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8')).client_email;
  const envVars = Object.entries(env).map(([name, value]) => ({ name, value }));

  return {
    apiVersion: 'serving.knative.dev/v1',
    kind: 'Service',
    metadata: {
      name: serviceName,
      namespace: PROJECT_ID,
      annotations: {
        'run.googleapis.com/ingress': 'all'
      }
    },
    spec: {
      template: {
        metadata: {
          annotations: {
            'autoscaling.knative.dev/maxScale': '3',
            'run.googleapis.com/startup-cpu-boost': 'true'
          }
        },
        spec: {
          serviceAccountName: serviceAccount,
          containerConcurrency: 80,
          timeoutSeconds: 300,
          containers: [
            {
              image,
              ports: [{ name: 'http1', containerPort: 8080 }],
              env: envVars
            }
          ]
        }
      }
    }
  };
}

async function deployCloudRun({ token, serviceName, image, env }) {
  const host = `${REGION}-run.googleapis.com`;
  const servicePath = `/apis/serving.knative.dev/v1/namespaces/${PROJECT_ID}/services/${serviceName}`;
  const body = cloudRunServiceBody({ serviceName, image, env });
  const existing = await request({ host, path: servicePath, token });

  let response;
  if (existing.status === 404) {
    response = await request({
      host,
      path: `/apis/serving.knative.dev/v1/namespaces/${PROJECT_ID}/services`,
      method: 'POST',
      token,
      headers: { 'Content-Type': 'application/json' },
      body
    });
  } else {
    const existingBody = JSON.parse(existing.body);
    body.metadata.resourceVersion = existingBody.metadata.resourceVersion;
    body.metadata.annotations = {
      ...(existingBody.metadata?.annotations || {}),
      ...(body.metadata.annotations || {})
    };
    response = await request({
      host,
      path: servicePath,
      method: 'PUT',
      token,
      headers: { 'Content-Type': 'application/json' },
      body
    });
  }

  if (response.status >= 300) {
    throw new Error(`Cloud Run deploy falló: ${response.body}`);
  }

  for (let index = 0; index < 80; index++) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const statusResponse = await request({ host, path: servicePath, token });
    const service = JSON.parse(statusResponse.body);
    const ready = (service.status?.conditions || []).find((condition) => condition.type === 'Ready');
    console.log(`Cloud Run ready: ${ready?.status || 'Unknown'} ${ready?.reason || ''}`);

    if (ready?.status === 'True') {
      return service.status.url;
    }

    if (ready?.status === 'False') {
      throw new Error(`Cloud Run no quedó listo: ${JSON.stringify(service.status, null, 2)}`);
    }
  }

  throw new Error('Cloud Run tardó demasiado.');
}

async function makeServicePublic({ token, serviceName }) {
  const response = await request({
    host: 'run.googleapis.com',
    path: `/v2/projects/${PROJECT_ID}/locations/${REGION}/services/${serviceName}:setIamPolicy`,
    method: 'POST',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: {
      policy: {
        bindings: [
          {
            role: 'roles/run.invoker',
            members: ['allUsers']
          }
        ]
      }
    }
  });

  return response;
}

module.exports = {
  ROOT,
  PROJECT_ID,
  REGION,
  BUILD_BUCKET,
  CREDENTIALS_PATH,
  getAccessToken,
  ensureBuildBucket,
  tarSource,
  uploadSource,
  runCloudBuild,
  deployCloudRun,
  makeServicePublic,
  request
};
