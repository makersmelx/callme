import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import fs from 'fs';
import { mkdirTree } from './mkdirTree';
import config from '../config';
import logger from './logger';

const updateSsmlAudioSupportLanguageCache = async () => {
  await mkdirTree(config.supportedListLocalCacheJson);
  const client = new TextToSpeechClient();
  const [result] = await client.listVoices({});
  const { voices } = result;
  fs.writeFile(config.supportedListLocalCacheJson, JSON.stringify(voices),
    (err) => {
      if (err) {
        logger.error(err.stack);
        logger.error(
          'Fail to update the local cache for support language list of ssml audio.',
        );
      } else {
        logger.info(
          'Update the local cache for support language list of ssml audio.',
        );
      }
    });
};

export default {
  updateSsmlAudioSupportLanguageCache,
};
