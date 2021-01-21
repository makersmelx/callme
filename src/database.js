const admin = require('firebase-admin');

// suppose we are using Google cloud SDK, so we can directly connect to Firestore
// admin.initializeApp({
//   credential: admin.credential.applicationDefault()
// });
const keyPath = process.env.KEY_PATH || '../credential/keyfile.json';
let serviceAccount = require(keyPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = db;
