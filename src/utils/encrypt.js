import crypto from 'crypto';

const SHA256Encrypt = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

export default {
  SHA256Encrypt
};
