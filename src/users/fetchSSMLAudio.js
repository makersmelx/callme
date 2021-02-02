import path from 'path';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import urls from '../server/urls';
import firebase from '../firebase';
import logger from '../logger';

const client = new TextToSpeechClient();
const bucket = firebase.storage.bucket(config.bucketName);
/**
 * fetch and store the SSML ssmlAudio, return the link to the ssmlAudio
 * @param name
 */
// todo: add error handler
const fetchSSMLAudio = async (name) => {
  const {
    ssml, language, ssmlGender, audio,
  } = name;
  if (audio.length > 0) {
    // delete current audio file if it exists
    const deleteFile = bucket.file(audio);
    // eslint-disable-next-line no-unused-vars
    deleteFile.delete((errRes, apiResponse) => {
      if (errRes) {
        const errorMessage = errRes.errors[0].message;
        logger.error(errorMessage);
      } else {
        logger.info(`Delete file ${path.join(config.storageBaseURL, audio)}`);
      }
    });
  }
  const request = {
    input: { ssml },
    voice: { languageCode: language, ssmlGender },
    audioConfig: { audioEncoding: 'MP3' },
  };
  const [response] = await client.synthesizeSpeech(request);

  const audioName = path.join(`${uuidv4()}.mp3`);
  const audioBucketPath = path.join(path.basename(urls.ssmlAudio), audioName);
  const file = bucket.file(audioBucketPath);
  file.save(response.audioContent, (errRes) => {
    if (errRes) {
      const errorMessage = errRes.errors[0].message;
      logger.error(errorMessage);
    } else {
      logger.info(
        `Upload file at ${path.join(config.storageBaseURL, audioName)}`,
      );
    }
  });
  return Promise.resolve(audioBucketPath);
};

export default fetchSSMLAudio;
