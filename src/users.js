const express = require('express');
const router = express.Router();
const db = require('./database');

const dbCollectionName = 'users';

router.get('/:username', ((req, res) => {
  const { username } = req.params;
  let userRef = db.collection(dbCollectionName).doc(username);
  let getDoc = userRef.get().then(doc => {
    if (!doc.exists) {
      throw new Error('No such data');
    } else {
      res.send(doc.data());
    }
  }).catch(err => {
    console.log('Error getting document', err);
  });
}));

router.post('/', (req, res) => {
  const { data } = req.body;
  // todo: consider invalid data with no username
  let userRef = db.collection(dbCollectionName).doc(data.username);
  delete data.username;
  let setDoc = userRef.set({ ...data });
  res.send('OK');
});

module.exports = router;
