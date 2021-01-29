import express from 'express';
import urls from './server/urls';
import users from './users';
import ssmlAudio from './ssmlAudio';

const app = express();

// if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
//   const webpack = require('webpack');
//   const webpackDevMiddleware = require('webpack-dev-middleware');
//   const config = require('../webpack.config.js');
//   const compiler = webpack(config);
//   // Tell express to use the webpack-dev-middleware and use the webpack.config.js
// // configuration file as a base.
//   app.use(webpackDevMiddleware(compiler, {
//     publicPath: config.output.publicPath
//   }));
//
// }

app.get('/', (req, res) => {
  res.send('Hello');
});

app.use(urls.users, users.router);
app.use(urls.ssmlAudio, ssmlAudio.router);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
