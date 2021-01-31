import express from 'express';
import firebase from '../firebase';
import config from '../config';
import logger from '../logger';

const router = express.Router();
const bucket = firebase.storage.bucket(config.bucketName);

router.delete('/:filePath', (req, res) => {
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
          res.send('Successfully delete');
        }
      }));
    }
  });
});

export default {
  router,
};
