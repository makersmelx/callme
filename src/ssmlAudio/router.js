import express from 'express';
import firebase from '../firebase';
import config from '../config';

const router = express.Router();
const bucket = firebase.storage.bucket(config.bucketName);

router.delete('/:filePath', (req, res) => {
  const { filePath } = req.params;
  const file = bucket.file(filePath);
  file.exists((err, exists) => {
    if (exists) {
      // eslint-disable-next-line no-unused-vars
      file.delete(filePath, ((err1, apiResponse) => {
        if (err1) {
          res.status(500).send('Unknown Error');
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
