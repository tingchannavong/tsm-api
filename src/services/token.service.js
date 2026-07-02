import prisma from "../libs/prismaClient.js";
import { hashToken } from "../utils/crypt.js";
import { generateToken, verifyUserToken } from "../utils/jwt.js";
import { verifyUserAuth } from "./auth.services.js";

const TTL_SECONDS = {
  REFRESH: 15 * 24 * 60 * 60, // 15 days
  INVITE: 3 * 24 * 60 * 60, // 3 days
  PASSWORD_RESET: 10 * 60, // 10 mins
}

const JWT_SECRETS = {
  REFRESH: process.env.REFRESH_KEY ,
  PASSWORD_RESET: process.env.RESET_KEY ,
  INVITE: process.env.INVITE_KEY ,
};

class TokenService {

  // create new token
  static async issue(type, options = {}, tx = prisma) {
    const ttl = TTL_SECONDS[type];
    const payload = {
      type,
      ...options
    }

    const rawToken = generateToken(payload, JWT_SECRETS[type], ttl);

    const result = await tx.token.create({
      data: {
      token: hashToken(rawToken),
      type,
      expiresAt: new Date(Date.now() + ttl * 1000),
      userId: options.userId || null,
      ipAddress: options.ipAddress || null,
      userAgent: options.userAgent || null,
    }
    });
    return {
      rawToken,
      result
    }
  }

  // verify token by find if it exists and not expired
  static async verify(rawToken, type, tx = prisma) {
    let decoded;
    try {
      decoded = verifyUserToken(rawToken, JWT_SECRETS[type]);
    } catch {
      return null;
    }

    if (decoded.type !== type) return null;

    const result = await tx.token.findUnique({
      where: { token: hashToken(rawToken)},
    });

    if (!result) return null;

    if (result.expiresAt < new Date()) {
      await this.revoke(result.id);
      return null
    }

    return { result, payload: decoded};
  }

  // delete by id
  static async revoke(token, tx = prisma) {
    await tx.token.delete({ where: { token: hashToken(token) } });
  }

  static async revokeAllForUser(userId, type) {
    await prisma.token.deleteMany({
      where: { userId, ...(type ? { type } : {} )}
    });
  }

  static async cleanUpExpired() {
    const { count } = await prisma.token.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return count;
  }
}

export default TokenService;