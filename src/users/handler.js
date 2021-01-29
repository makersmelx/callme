import multer from 'multer';
import bodyParser from 'body-parser';
import express from 'express';
import utils from '../utils';
import db from '../database';
import ssmlAudio from '../ssmlAudio/handler';

const router = express.Router();
const dbCollection = db.collection('users');
const upload = multer();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/:username', ((req, res) => {
  const { username } = req.params;
  const userRef = dbCollection.doc(username);
  userRef.get().then((doc) => {
    if (!doc.exists) {
      res.status(404).send('Data not found');
    } else {
      res.send(doc.data());
    }
  }).catch(() => {
    throw new Error('Unknown error');
  });
}));

router.post('/', upload.array(), async (req, res) => {
  const reqBody = req.body;
  const userRef = dbCollection.doc(reqBody.username);
  const userData = {
    password: utils.SHA256Encrypt(reqBody.password),
    names: [...reqBody.names],
    option: { ...reqBody.option },
  };
  // fetch ssmlAudio
  // eslint-disable-next-line no-restricted-syntax
  for (const name of (userData.names)) {
    // eslint-disable-next-line no-await-in-loop
    name.audio = await ssmlAudio.fetchSSMLAudio(name, reqBody.username);
  }
  userRef.set({ ...userData }).then((message) => {
    res.send(message);
  }, (errMessage) => {
    res.status(404).send(errMessage);
  });
});

router.put('/', upload.array(), async (req, res) => {
  const reqBody = req.body;
  const { username } = reqBody;
  const userRef = dbCollection.doc(username);
  const serverData = await userRef.get().then((doc) => {
    if (!doc.exists) {
      res.status(404).send('Data not found');
      return Promise.resolve(undefined);
    }
    return Promise.resolve(doc.data());
  });
  // todo: improve error handler
  if (!serverData) {
    return;
  }

  if (utils.SHA256Encrypt(reqBody.password) !== serverData.password) {
    res.status(403).send('Incorrect password');
    return;
  }
  const userData = {
    password: serverData.password,
    names: [...reqBody.names],
    option: { ...reqBody.option },
  };
  // selectively update ssmlAudio
  // eslint-disable-next-line no-restricted-syntax
  for (const [index, name] of (userData.names).entries()) {
    if (name.ssml !== serverData.names[index].ssml) {
      // set back to current mp3 url
      name.audio = serverData.names[index].audio;
      // eslint-disable-next-line no-await-in-loop
      name.audio = await ssmlAudio.fetchSSMLAudio(name);
    } else {
      name.audio = serverData.names[index].audio;
    }
  }
  userRef.set({ ...userData }).then((message) => {
    res.send(message);
  }, (errMessage) => {
    res.status(404).send(errMessage);
  });
});

export default {
  router,
};
