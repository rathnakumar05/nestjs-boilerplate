import { createHash, randomBytes } from 'crypto';

export default class CryptoUtil {
  static generateRandomToken(): string {
    return randomBytes(32).toString('hex');
  }

  static hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }
}
