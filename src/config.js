import path from 'path';
import rootPath from 'app-root-path';

const logDir = path.join(rootPath.toString(), 'log');
export default {
  bucketName: 'cm-2021.appspot.com',
  logger: {
    logDir,
    errorLog: path.join(logDir, 'error.log'),
    infoLog: path.join(logDir, 'callme.log'),
  },
  storageBaseURL: 'cm-2021.appspot.com/',
};
