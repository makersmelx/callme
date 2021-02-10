import express from 'express';
import fs from 'fs';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import config from '../config';
import file from './file';
import logger from '../utils/logger';
import { CallMeError, handleError, mkdirTree } from '../utils';
import fetchSSMLAudio from '../users/fetchSSMLAudio';

const router = express.Router();

router.use('/file', file.router);

router.get('/supportedList', handleError(async (req, res) => {
  await mkdirTree(config.supportedListLocalCacheJson);
  try {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    const localCache = require(config.supportedListLocalCacheJson);
    logger.info(
      'Local cache found. Load support language list of ssml audio from local cache.',
    );
    res.json(localCache);
  } catch (err) {
    logger.info(
      'Local cache not found. Download support language list of ssml audio from Google.',
    );
    const client = new TextToSpeechClient();
    const [result] = await client.listVoices({});
    const { voices } = result;
    fs.writeFile(config.supportedListLocalCacheJson, JSON.stringify(voices),
      () => {
        logger.error(
          `Fail to save data to local cache ${config.supportedListLocalCacheJson}.`,
        );
      });
    res.json(voices);
  }
}));

router.post('/', handleError(async (req, res, next) => {
  const { ssml, language, ssmlGender } = req.body;
  if (!(ssml && language && ssmlGender)) {
    return Promise.reject(new CallMeError({
      code: 400,
      message: 'Missing ssml or language or ssmlGender',
    }));
  }
  next();
}), handleError(async (req, res) => {
  const { ssml, language, ssmlGender } = req.body;
  const name = {
    ssml,
    language,
    ssmlGender,
    audio: '',
  };
  res.send(await fetchSSMLAudio(name));
}));

export default {
  router,
};
