import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const bcryptSaltRounds = 10;
const HmacEncrypt = (data) => crypto.createHmac('sha256',
  process.env.HMAC_SECRET).update(data).digest('hex');

export const mozillaEncrypt = async (data) => bcrypt.hash(
  HmacEncrypt(data), bcryptSaltRounds,
);

export const mozillaPasswordCompare = async (
  plainTextPassword, hashedPassword,
) => bcrypt.compare(HmacEncrypt(plainTextPassword),
  hashedPassword);
