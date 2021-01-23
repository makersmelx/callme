export const SHA256Encrypt = (data: string) => {
  return require('crypto').createHash('sha256').update(data).digest('hex');
};
