import express from 'express';
import db from '../database';
import { SHA256Encrypt } from '../utils/encrypt';

const router = express.Router();

const dbCollection = db.collection('users');

router.get('/:username', ((req, res) => {
  const { username } = req.params;
  let userRef = dbCollection.doc(username);
  userRef.get().then(doc => {
    if (!doc.exists) {
      res.status(404).send('Data not found');
    } else {
      res.send(doc.data());
    }
  }).catch(err => {
    throw new Error('Unknown error');
  });
}));

router.post('/', (req, res) => {
  const data: UserForm = req.body;
  let userRef = dbCollection.doc(data.username);
  delete data.username;
  data.password = SHA256Encrypt(data.password);
  userRef.set({ ...data }).then(() => {
    res.send('OK');
  }).catch(err => {
    throw new Error('Unknown error');
  });
});

router.put('/:username', async (req, res) => {
  const { username } = req.params;
  const reqData: UserForm = req.body;
  let userRef = dbCollection.doc(username);
  await userRef.get().then(doc => {
    if (!doc.exists) {
      res.status(404).send('Not found');
    }
    const data: UserModel = doc.data();
    if (data.password !== SHA256Encrypt(reqData.password)) {
      res.status(403).send('Unauthorized');
    }
  });
});

export default router;
