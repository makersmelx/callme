import express from 'express';
import users from './users/handler';
import * as _ from 'lodash';

const app = express();
app.get('/', (req, res) => {
  res.send('Hello');
});

app.use('/users', users);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
