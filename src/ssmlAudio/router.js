import express from 'express';
import fs from 'fs';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import config from '../config';
import file from './file';
import logger from '../utils/logger';
import { handleError, mkdirTree } from '../utils';

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

export default {
  router,
};
