/**
 * database.config.ts
 *
 * NestJS namespaced configuration for PostgreSQL / Amazon RDS.
 *
 * Usage
 * ─────
 * constructor(
 *   @Inject(databaseConfig.KEY)
 *   private readonly db: ConfigType<typeof databaseConfig>,
 * ) {}
 *
 * Or via ConfigService:
 *   this.configService.get('database.host')
 */

import { registerAs } from '@nestjs/config';
import { DatabaseSchema } from '../env.schema';

export const databaseConfig = registerAs('database', () => {
  const env = DatabaseSchema.parse(process.env);

  return {
    host: env.DB_HOST,
    port: env.DB_PORT,
    name: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    ssl: env.DB_SSL,
    sslCa: env.DB_SSL_CA,
    pool: {
      max: env.DB_POOL_MAX,
      min: env.DB_POOL_MIN,
      idleTimeoutMs: env.DB_POOL_IDLE_TIMEOUT_MS,
      acquireTimeoutMs: env.DB_POOL_ACQUIRE_TIMEOUT_MS,
    },
    autoMigrate: env.DB_AUTO_MIGRATE,
    logging: env.DB_LOGGING,

    /** TypeORM DataSource-compatible object for direct consumption */
    get typeOrmOptions() {
      return {
        type: 'postgres' as const,
        host: env.DB_HOST,
        port: env.DB_PORT,
        database: env.DB_NAME,
        username: env.DB_USER,
        password: env.DB_PASSWORD,
        ssl: env.DB_SSL ? { rejectUnauthorized: true, ca: env.DB_SSL_CA } : false,
        extra: {
          max: env.DB_POOL_MAX,
          min: env.DB_POOL_MIN,
          idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT_MS,
          connectionTimeoutMillis: env.DB_POOL_ACQUIRE_TIMEOUT_MS,
        },
        synchronize: false, // always use migrations
        migrationsRun: env.DB_AUTO_MIGRATE,
        logging: env.DB_LOGGING ? ['query', 'error'] : ['error'],
      };
    },
  } as const;
});

export type DatabaseConfig = ReturnType<typeof databaseConfig>;
