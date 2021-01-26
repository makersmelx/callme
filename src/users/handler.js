import utils from '../utils';
import express from 'express';
import db from '../database.js';
import ssmlAudio from '../ssmlAudio/handler.js';
import bodyParser from 'body-parser';
import multer from 'multer';

const router = express.Router();
const dbCollection = db.collection('users');
const upload = multer();

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

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

router.post('/', upload.array(), async (req, res) => {
  let reqBody = req.body;
  let userRef = dbCollection.doc(reqBody.username);
  const userData = {
    password: utils.SHA256Encrypt(reqBody.password),
    names: [...reqBody.names],
    option: { ...reqBody.option }
  };
  // fetch ssmlAudio
  for (let name of (userData.names)) {
    name.audio = await ssmlAudio.fetchSSMLAudio(name, reqBody.username);
  }
  userRef.set({ ...userData }).then((message) => {
    res.send(message);
  }, (errMessage) => {
    res.status(404).send(errMessage);
  });
});

router.put('/:username', upload.array(), async (req, res) => {
  const { username } = req.params;
  let userRef = dbCollection.doc(username);
  const serverData = await userRef.get().then(doc => {
    if (!doc.exists) {
      res.status(404).send('Data not found');
    } else {
      return Promise.resolve(doc.data());
    }
  });
  let reqBody = req.body;
  if (utils.SHA256Encrypt(reqBody.password) !== serverData.password) {
    res.status(403).send('Incorrect password');
    return;
  }
  const userData = {
    password: serverData.password,
    names: [...reqBody.names],
    option: { ...reqBody.option }
  };
  // selectively update ssmlAudio
  for (const [index, name] of (userData.names).entries()) {
    if (name.ssml !== serverData.names[index].ssml) {
      // set back to current mp3 url
      name.audio = serverData.names[index].audio;
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
  router
};
