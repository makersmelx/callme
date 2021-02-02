import express from 'express';
import urls from './server/urls';
import users from './users';
import ssmlAudio from './ssmlAudio';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello');
});

app.use(urls.users, users.router);
app.use(urls.ssmlAudio, ssmlAudio.router);
app.use((err, req, res, next) => {
  // Handle errors here
  console.error(err);
  res.status(400).json({
    message: 'Something wrong bruh.',
  });
  next();
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
