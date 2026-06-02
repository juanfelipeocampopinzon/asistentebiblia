const { PROJECT_ID, REGION, getAccessToken, request } = require('./cloud-utils');

async function main() {
  const token = await getAccessToken();

  const buildsResponse = await request({
    host: 'cloudbuild.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/builds?pageSize=5`,
    token
  });
  const builds = JSON.parse(buildsResponse.body).builds || [];

  console.log('Últimos builds:');
  for (const build of builds) {
    console.log(JSON.stringify({
      id: build.id,
      status: build.status,
      createTime: build.createTime,
      images: build.results?.images?.map((image) => image.name) || [],
      logUrl: build.logUrl
    }, null, 2));
  }

  const servicesResponse = await request({
    host: `${REGION}-run.googleapis.com`,
    path: `/apis/serving.knative.dev/v1/namespaces/${PROJECT_ID}/services`,
    token
  });
  const services = JSON.parse(servicesResponse.body).items || [];

  console.log('\nServicios Cloud Run:');
  for (const service of services) {
    console.log(JSON.stringify({
      name: service.metadata.name,
      url: service.status?.url,
      ready: (service.status?.conditions || []).find((condition) => condition.type === 'Ready')?.status,
      image: service.spec?.template?.spec?.containers?.[0]?.image
    }, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
