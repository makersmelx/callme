import fs from 'fs';
import path from 'path';
import util from 'util';

export const mkdirTree = async (dirname) => {
  const access = util.promisify(fs.access);
  const mkdir = util.promisify(fs.mkdir);
  return access(path.dirname(dirname)).catch(
    async () => mkdirTree(path.dirname(dirname)),
  ).then(async () => {
    if (!path.extname(dirname)) {
      await mkdir(dirname);
    }
  });
};
