import crypto from 'crypto';

export const SHA256Encrypt = (data) => crypto.createHash('sha256').update(data).digest('hex');
