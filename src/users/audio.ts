import config from '../config';
import express from 'express';
import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import fs from 'fs';
import util from 'util';
import path from 'path';
import urlJoin from 'url-join';
import { Name } from './model';

const router = express.Router();
const client = new TextToSpeechClient();

// audio file storage
router.use(express.static(config.audioDir));

/**
 * fetch and store the SMML audio, return the link to the audio
 * @param name
 * @param username
 */
const fetchSSMLAudio = async (name: Name, username: string) => {
  const { ssml, language, ssmlGender } = name;
  const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
    input: { ssml: ssml },
    voice: { languageCode: language, ssmlGender: ssmlGender },
    audioConfig: { audioEncoding: 'MP3' }
  };
  const audioURL = path.join(username, `${name.type}.mp3`);
  const audioPath = path.join(config.audioDir, audioURL);

  const [response] = await client.synthesizeSpeech(request);
  const writeFile = util.promisify(fs.writeFile);
  await writeFile(audioPath, response.audioContent, 'binary');

  return Promise.resolve(urlJoin(config.baseURL, audioURL));
};

export default {
  router,
  fetchSSMLAudio
};
