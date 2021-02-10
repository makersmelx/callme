import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import firebase from '../firebase';
import config from '../config';
import logger from '../utils/logger';
import { CallMeError, handleError, mkdirTree } from '../utils';
import urls from '../server/urls';

const router = express.Router();
const bucket = firebase.storage.bucket(config.bucketName);
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/supportedList', handleError(async (req, res) => {
  await mkdirTree(config.supportedListLocalCacheJson);
  try {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    const localCache = require(config.supportedListLocalCacheJson);
    res.json(localCache);
  } catch (err) {
    const client = new TextToSpeechClient();
    const [result] = await client.listVoices({});
    const { voices } = result;
    fs.writeFile(config.supportedListLocalCacheJson, JSON.stringify(voices),
      () => {
      });
    res.json(voices);
  }
}));

router.delete('/:filePath', handleError((req, res) => {
  const { filePath } = req.params;
  const file = bucket.file(filePath);
  file.exists((err, exists) => {
    if (exists) {
      // eslint-disable-next-line no-unused-vars
      file.delete(filePath, ((errRes, apiResponse) => {
        if (errRes) {
          const errorMessage = errRes.errors[0].message;
          logger.error(errorMessage);
          res.status(errRes.code).send(errorMessage);
        } else {
          const logInfo = `Delete file ${path.join(config.storageBaseURL,
            filePath)}`;
          logger.info(logInfo);
          res.send(logInfo);
        }
      }));
    }
  });
}));

router.post('/', upload.single('audio'), handleError(async (req, res, next) => {
  if (!req.file) {
    return Promise.reject(new CallMeError({
      code: 400,
      message: 'No file has been uploaded',
    }));
  }
  const { originalname } = req.file;
  const extName = path.extname(originalname).slice(1);
  // audio ext is not supported
  if (config.supportedAudioExt.indexOf(extName) === -1) {
    return Promise.reject(new CallMeError({
      code: 400,
      message: `${extName} file is not supported here`,
    }));
  }
  next();
}), handleError(async (req, res) => {
  const { buffer } = req.file;
  const audioName = `${uuidv4()}.mp3`;
  // this is the path without slash at the beginning
  const audioBucketPath = path.join(path.basename(urls.ssmlAudio), audioName);
  const file = bucket.file(audioBucketPath);
  try {
    await file.save(buffer).then(() => {
      logger.info(
        `Upload file at ${path.join(config.storageBaseURL, audioBucketPath)}`,
      );
    }, (errRes) => Promise.reject(new CallMeError({
      code: errRes.code,
      message: JSON.stringify(errRes.errors),
    })));
  } catch (err) {
    return Promise.reject(err);
  }
  res.send(audioBucketPath);
}));
export default {
  router,
};
