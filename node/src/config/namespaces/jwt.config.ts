/**
 * jwt.config.ts
 *
 * NestJS namespaced configuration for JWT authentication.
 *
 * Supports both symmetric (HS*) and asymmetric (RS*) algorithms.
 * In production, use RS256 with key material sourced from AWS Secrets Manager
 * (loaded via the SecretsManagerLoader before bootstrap).
 *
 * Usage
 * ─────
 * constructor(
 *   @Inject(jwtConfig.KEY)
 *   private readonly jwt: ConfigType<typeof jwtConfig>,
 * ) {}
 */

import { registerAs } from '@nestjs/config';
import { JwtSchema } from '../env.schema';

export const jwtConfig = registerAs('jwt', () => {
  const env = JwtSchema.parse(process.env);

  const isAsymmetric = env.JWT_ALGORITHM.startsWith('RS');

  if (isAsymmetric && (!env.JWT_PUBLIC_KEY || !env.JWT_PRIVATE_KEY)) {
    throw new Error(
      `JWT_ALGORITHM is ${env.JWT_ALGORITHM} but JWT_PUBLIC_KEY and JWT_PRIVATE_KEY are not set. ` +
        'Provide base64-encoded PEM keys or switch to a symmetric algorithm for development.',
    );
  }

  const decodeKey = (b64?: string): string | undefined =>
    b64 ? Buffer.from(b64, 'base64').toString('utf-8') : undefined;

  return {
    secret: env.JWT_SECRET,
    algorithm: env.JWT_ALGORITHM,
    publicKey: decodeKey(env.JWT_PUBLIC_KEY),
    privateKey: decodeKey(env.JWT_PRIVATE_KEY),
    accessTokenTtl: env.JWT_ACCESS_TOKEN_TTL,
    refreshTokenTtl: env.JWT_REFRESH_TOKEN_TTL,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    isAsymmetric,

    /** @nestjs/jwt module options — use directly in JwtModule.registerAsync */
    get moduleOptions() {
      return {
        secret: isAsymmetric ? undefined : env.JWT_SECRET,
        privateKey: isAsymmetric ? decodeKey(env.JWT_PRIVATE_KEY) : undefined,
        publicKey: isAsymmetric ? decodeKey(env.JWT_PUBLIC_KEY) : undefined,
        signOptions: {
          algorithm: env.JWT_ALGORITHM,
          expiresIn: env.JWT_ACCESS_TOKEN_TTL,
          issuer: env.JWT_ISSUER,
          audience: env.JWT_AUDIENCE,
        },
      };
    },
  } as const;
});

export type JwtConfig = ReturnType<typeof jwtConfig>;
