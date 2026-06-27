import bcrypt from 'bcrypt';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

export async function hashString(string) {
  return await bcrypt.hash(string, SALT_ROUNDS);
}

export async function compareStrings(string, hash) {
  return await bcrypt.compare(string, hash);
}