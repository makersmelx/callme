const express = require('express');
const app = express();
const db = require('./database');
const users = require('./users');
app.get('/', (req, res) => {
  res.send('Hello');
});

app.use('/users', users);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
