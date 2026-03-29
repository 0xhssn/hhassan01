/**
 * app.config.ts
 *
 * NestJS namespaced configuration for core application settings.
 * Inject with: @Inject(appConfig.KEY) private cfg: ConfigType<typeof appConfig>
 */

import { registerAs } from '@nestjs/config';
import { AppSchema } from '../env.schema';

export const appConfig = registerAs('app', () => {
  const env = AppSchema.parse(process.env);

  return {
    nodeEnv: env.NODE_ENV,
    name: env.APP_NAME,
    port: env.APP_PORT,
    host: env.APP_HOST,
    version: env.APP_VERSION,
    apiPrefix: env.API_PREFIX,
    corsOrigins: env.CORS_ORIGINS,
    bodyLimit: env.BODY_LIMIT,
    region: env.APP_REGION,
    isProduction: env.NODE_ENV === 'production',
    isStaging: env.NODE_ENV === 'staging',
    isDevelopment: env.NODE_ENV === 'development',
    isTest: env.NODE_ENV === 'test',
    log: {
      level: env.LOG_LEVEL,
      format: env.LOG_FORMAT,
    },
  } as const;
});

export type AppConfig = ReturnType<typeof appConfig>;
