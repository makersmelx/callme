import express from 'express';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import firebase from '../../firebase';
import config from '../../config';
import logger from '../../utils/logger';
import { CallMeError, handleError } from '../../utils';
import urls from '../../server/urls';

const router = express.Router();
const bucket = firebase.storage.bucket(config.bucketName);
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
