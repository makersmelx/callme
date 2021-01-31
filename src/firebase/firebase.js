import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
const database = admin.firestore();

const storage = admin.storage();

export default {
  database,
  storage,
};
