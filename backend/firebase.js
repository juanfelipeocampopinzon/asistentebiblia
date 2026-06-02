const fs = require('fs');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

if (admin.apps.length === 0) {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (credentialsPath && fs.existsSync(credentialsPath)) {
    const credentials = require(credentialsPath);
    if (credentials.type === 'service_account') {
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
        projectId: credentials.project_id
      });
    } else {
      admin.initializeApp({
        projectId: process.env.PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT
      });
    }
  } else {
    admin.initializeApp({
      projectId: process.env.PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT
    });
  }
}

const db = getFirestore(admin.app(), process.env.FIRESTORE_DATABASE_ID || '(default)');

module.exports = { admin, db };
