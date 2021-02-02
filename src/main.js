import express from 'express';
import urls from './server/urls';
import users from './users';
import ssmlAudio from './ssmlAudio';
import { errorMiddleware } from './utils';

const app = express();
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

app.get('/', (req, res) => {
  res.send('Hello');
});

app.use(urls.users, users.router);
app.use(urls.ssmlAudio, ssmlAudio.router);
app.use(errorMiddleware);
