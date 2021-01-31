import express from 'express';
import config from '../config';

const router = express.Router();
// ssmlAudio file storage
router.use(express.static(config.audioDir));

export default {
  router,
};
