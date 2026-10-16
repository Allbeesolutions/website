'use strict';
const crypto = require('node:crypto');
function keyFromEnv(env = process.env.BACKUP_ENCRYPTION_KEY) {
  if (typeof env !== 'string' || !/^[a-f0-9]{64}$/i.test(env)) throw new Error('BACKUP_ENCRYPTION_KEY must be 64 hexadecimal characters (32 random bytes).');
  return Buffer.from(env,'hex');
}
function validate(data) {
  if (!data || data.schema !== 'allbee-invitations-v1' || typeof data.createdAt !== 'string' ||
      !['leads','orders','reviews'].every(k => Array.isArray(data[k])) ||
      Object.values(data).some(v => typeof v === 'function')) throw new Error('Invalid backup schema');
  for (const type of ['leads','orders','reviews']) if(data[type].length > 200000) throw new Error('Dataset too large');
  return data;
}
function encrypt(data, key) {
  validate(data);
  const iv=crypto.randomBytes(12);
  const cipher=crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext=Buffer.from(JSON.stringify(data),'utf8');
  if (plaintext.length > 100*1024*1024) throw new Error('Backup too large');
  const ciphertext=Buffer.concat([cipher.update(plaintext),cipher.final()]);
  return JSON.stringify({format:'allbee-aes256-gcm-v1',iv:iv.toString('base64url'),tag:cipher.getAuthTag().toString('base64url'),data:ciphertext.toString('base64url')})+'\n';
}
function decrypt(envelope,key) {
  const e=JSON.parse(envelope);
  if(!e || e.format !== 'allbee-aes256-gcm-v1' || typeof e.iv!=='string' || typeof e.tag!=='string' || typeof e.data!=='string') throw new Error('Invalid encrypted envelope');
  const iv=Buffer.from(e.iv,'base64url'),tag=Buffer.from(e.tag,'base64url'),payload=Buffer.from(e.data,'base64url');
  if(iv.length!==12 || tag.length!==16 || payload.length>100*1024*1024) throw new Error('Invalid encrypted envelope lengths');
  const decipher=crypto.createDecipheriv('aes-256-gcm',key,iv);decipher.setAuthTag(tag);
  const content=Buffer.concat([decipher.update(payload),decipher.final()]);
  return validate(JSON.parse(content.toString('utf8')));
}
module.exports={keyFromEnv,encrypt,decrypt,validate};
