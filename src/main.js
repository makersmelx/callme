import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cron from 'node-cron';
import urls from './server/urls';
import users from './users';
import ssmlAudio from './ssmlAudio';
import { cronTasks, errorMiddleware } from './utils';

const app = express();
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
app.use(morgan('combined', {}));
app.get('/', (req, res) => {
  res.send('Hello');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(urls.users, users.router);
app.use(urls.ssmlAudio, ssmlAudio.router);
app.use(errorMiddleware);

cron.schedule('* * */12 * *', cronTasks.updateSsmlAudioSupportLanguageCache,
  {});
