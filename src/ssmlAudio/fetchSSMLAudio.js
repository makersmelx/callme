import urlJoin from 'url-join';
import path from 'path';
import fs from 'fs';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import urls from '../server/urls';

const client = new TextToSpeechClient();

/**
 * fetch and store the SMML ssmlAudio, return the link to the ssmlAudio
 * @param name
 */
// todo: add error handler
const fetchSSMLAudio = async (name) => {
  const {
    ssml, language, ssmlGender, audio,
  } = name;
  if (audio.length > 0) {
    const audioPath = path.join(config.audioDir, path.basename(audio));
    // delete current audio if it exists
    fs.access(audioPath, fs.constants.F_OK, ((existErr) => {
      if (!existErr) {
        fs.unlink(audioPath, (rmErr) => {
          if (rmErr) {
            console.error(rmErr);
          }
        });
      }
    }));
  }
  const request = {
    input: { ssml },
    voice: { languageCode: language, ssmlGender },
    audioConfig: { audioEncoding: 'MP3' },
  };
  const audioName = path.join(`${uuidv4()}.mp3`);
  const audioPath = path.join(config.audioDir, audioName);
  const [response] = await client.synthesizeSpeech(request);
  // todo: add dir tree create
  fs.writeFile(audioPath, response.audioContent,
    { encoding: 'binary', flag: 'w+' }, (err) => {
      if (err) {
        console.error(err);
      }
    });
  return Promise.resolve(urlJoin(urls.ssmlAudio, audioName));
};

export default {
  fetchSSMLAudio,
};
