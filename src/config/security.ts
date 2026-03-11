const MIN_JWT_SECRET_LENGTH = 32;
let cachedJwtSecret: string | null = null;
let warnedAboutDevSecret = false;

export function getJwtSecret(): string {
  if (cachedJwtSecret) {
    return cachedJwtSecret;
  }

  const jwtSecret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!jwtSecret || jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    if (isProduction) {
      throw new Error(
        `JWT_SECRET must be set and at least ${MIN_JWT_SECRET_LENGTH} characters in production`
      );
    }

    if (!warnedAboutDevSecret) {
      console.warn(
        `JWT_SECRET is missing or too short. Using development fallback secret. Do not use this in production.`
      );
      warnedAboutDevSecret = true;
    }
    cachedJwtSecret = 'dev-only-jwt-secret-change-before-production';
    return cachedJwtSecret;
  }

  cachedJwtSecret = jwtSecret;
  return cachedJwtSecret;
}

export function getJwtExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN || '24h';
}
