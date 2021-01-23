const admin = require('firebase-admin');

if (process.env.KEY_PATH) {
  // connect firestore through json key
  const keyPath = process.env.KEY_PATH;
  let serviceAccount = require(keyPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  // using Google cloud SDK, so we can directly connect to Firestore
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}
const db = admin.firestore();
export default db;
