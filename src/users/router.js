import multer from 'multer';
import bodyParser from 'body-parser';
import express from 'express';
import utils from '../utils';
import firebase from '../firebase';
import ssmlAudio from '../ssmlAudio';

const router = express.Router();
const dbCollection = firebase.database.collection('users');
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
      const data = doc.data();
      delete data.password;
      res.send(data);
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
    names: { ...reqBody.names },
    option: { ...reqBody.option },
  };
  // fetch ssmlAudio
  for (const key of Object.keys(userData.names)) {
    const name = userData.names[key];
    if (name.ssml) {
      name.audio = await ssmlAudio.fetchSSMLAudio(name, reqBody.username);
    }
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
    names: { ...reqBody.names },
    option: { ...reqBody.option },
  };
  // selectively update ssmlAudio
  for (const key of Object.keys(userData.names)) {
    const name = userData.names[key];
    if (name.ssml) {
      // set back to current audio url
      name.audio = serverData.names[key].audio;
      // if the ssml text has been changed in this update, update the audio
      if (!serverData.names[key].ssml || name.ssml
        !== serverData.names[key].ssml) {
        name.audio = await ssmlAudio.fetchSSMLAudio(name);
      }
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
