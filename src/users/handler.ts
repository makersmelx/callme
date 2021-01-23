import express from 'express';
import db from '../database';
import { SHA256Encrypt } from '../utils/encrypt';
import SSMLAudio from './audio';
import { UserForm, UserModel } from './model';

const router = express.Router();

const dbCollection = db.collection('users');

const updateUserData = async (reqBody: UserForm) => {
  let userRef = dbCollection.doc(reqBody.username);
  const userData: UserModel = {
    password: SHA256Encrypt(reqBody.password),
    names: [...reqBody.names],
    option: { ...reqBody.option }
  };
  // fetch audio
  for (let name of (userData.names)) {
    name.audio = await SSMLAudio.fetchSSMLAudio(name, reqBody.username);
  }
  userRef.set({ ...userData }).then(() => {
    Promise.resolve('OK');
  }).catch(err => {
    Promise.reject('Unknown error');
  });
};

// audio file storage
router.use(SSMLAudio.router);

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

router.post('/', async (req, res) => {
  updateUserData(req.body).then((message) => {
    res.send(message);
  }, (errMessage) => {
    res.status(404).send(errMessage);
  });
});

router.put('/:username', async (req, res) => {
  updateUserData(req.body).then((message) => {
    res.send(message);
  }, (errMessage) => {
    res.status(404).send(errMessage);
  });
});

export default router;
