import express from 'express';
import {
  mozillaEncrypt,
  handleError,
  logger,
  CallMeError,
  redact,
  mozillaPasswordCompare,
} from '../utils';
import firebase from '../firebase';
import fetchSSMLAudio from './fetchSSMLAudio';

const router = express.Router();
const dbCollection = firebase.database.collection('users');

router.get('/:username', handleError(async (req, res) => {
  const { username } = req.params;
  const userRef = dbCollection.doc(username);

  await userRef.get().then((doc) => {
    if (!doc.exists) {
      return Promise.reject(new CallMeError({
        code: 404,
        message: 'The resource you are trying to reach either does not exist or you are not authorized to view it.',
      }));
    }
    const data = doc.data();
    delete data.password;
    res.send(data);
  });
}));

router.post('/', handleError(async (req, res, next) => {
  const reqBody = req.body;
  const { username } = reqBody;
  const userRef = dbCollection.doc(username);
  await userRef.get().then((doc) => {
    if (doc.exists) {
      throw new CallMeError({
        code: 403,
        message: `User ${username} already exists.`,
      });
    }
  });
  next();
}), handleError(async (req, res) => {
  const reqBody = req.body;
  const userRef = dbCollection.doc(reqBody.username);
  const userData = {
    password: await mozillaEncrypt(reqBody.password),
    names: { ...reqBody.names },
    option: { ...reqBody.option },
  };
  // fetch ssmlAudio
  for (const key of Object.keys(userData.names)) {
    const name = userData.names[key];
    if (name.ssml) {
      name.audio = await fetchSSMLAudio(name);
    }
  }
  await userRef.set({ ...userData }).then(() => {
    const message = `Create document ${reqBody.username}`;
    logger.info(`${message}: ${JSON.stringify(redact.map(userData))}`);
    res.send(message);
  }, () => Promise.reject(new CallMeError({
    code: 404,
    message: `Fail to create document ${reqBody.username}`,
  })));
}));

router.put('/', handleError(async (req, res, next) => {
  const reqBody = req.body;
  const { username } = reqBody;
  const userRef = dbCollection.doc(username);
  const serverData = await userRef.get().then((doc) => {
    if (!doc.exists) {
      throw new CallMeError({
        code: 404,
        message: 'The resource you are trying to reach either does not exist or you are not authorized to view it.',
      });
    }
    return Promise.resolve(doc.data());
  });
  if (!await mozillaPasswordCompare(reqBody.password, serverData.password)) {
    throw new CallMeError({
      code: 404,
      message: 'The resource you are trying to reach either does not exist or you are not authorized to view it.',
    });
  }
  req.serverData = serverData;
  next();
}), handleError(async (req, res) => {
  const reqBody = req.body;
  const { username } = reqBody;
  const userRef = dbCollection.doc(username);
  const { serverData } = req;
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
        name.audio = await fetchSSMLAudio(name);
      }
    }
  }
  userRef.set({ ...userData }).then(() => {
    const message = `Update document ${reqBody.username}`;
    logger.info(`${message}: ${JSON.stringify(redact.map(userData))}`);
    res.send(message);
  }, () => Promise.reject(new CallMeError({
    code: 404,
    message: `Fail to update document ${reqBody.username}`,
  })));
}));

export default router;
