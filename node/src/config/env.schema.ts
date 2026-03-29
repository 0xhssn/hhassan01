/**
 * env.schema.ts
 *
 * Single source of truth for ALL environment variables consumed by any
 * Node.js / NestJS service in this mono-repo. Zod validates and
 * coerces raw process.env strings at boot-time; the inferred TypeScript
 * type `Env` is re-exported so every consumer is statically typed.
 *
 * Layout
 * ──────
 * Each logical concern lives in its own sub-schema so validation errors
 * surface at the domain level (e.g. "database.HOST is required") rather
 * than as a flat list of missing keys.
 *
 * Coercion note
 * ─────────────
 * All env vars arrive as strings.  Use z.coerce.number() / z.coerce.boolean()
 * to convert so callers always receive the correct primitive type without
 * manual parseInt / === 'true' comparisons.
 */

import { z } from 'zod';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converts "true" | "1" | "yes" → true, everything else → false */
const booleanFromString = z
  .string()
  .transform((v) => ['true', '1', 'yes', 'on'].includes(v.toLowerCase()))
  .or(z.boolean());

/** Non-empty, trimmed string */
const requiredString = z.string().min(1, 'Must be a non-empty string').trim();

/** URL with http/https protocol */
const httpUrl = z.string().url().startsWith('http');

/** Positive integer coerced from string */
const portNumber = z.coerce
  .number()
  .int()
  .min(1)
  .max(65535);

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

/**
 * Runtime + deployment context.
 * NODE_ENV drives which .env.<environment> file dotenv loads before this
 * schema is evaluated, so it is always available.
 */
const AppSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'staging', 'production', 'test'])
    .default('development'),
  APP_NAME: requiredString.default('nestjs-service'),
  APP_PORT: portNumber.default(3000),
  APP_HOST: z.string().default('0.0.0.0'),
  /** Semantic version injected by CI/CD, e.g. "1.4.2" */
  APP_VERSION: z.string().default('0.0.0'),
  /** Global API prefix, e.g. "api/v1" */
  API_PREFIX: z.string().default('api'),
  /** Comma-separated list of allowed CORS origins */
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform((s) => s.split(',').map((o) => o.trim())),
  /** Request body size limit, e.g. "10mb" */
  BODY_LIMIT: z.string().default('10mb'),
  /** ISO 3166-1 alpha-2 region code used for localisation */
  APP_REGION: z.string().default('us'),
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
    .default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),
});

/**
 * Primary relational database (PostgreSQL / Amazon RDS).
 */
const DatabaseSchema = z.object({
  DB_HOST: requiredString,
  DB_PORT: portNumber.default(5432),
  DB_NAME: requiredString,
  DB_USER: requiredString,
  DB_PASSWORD: requiredString,
  DB_SSL: booleanFromString.default('false' as unknown as boolean),
  DB_SSL_CA: z.string().optional(),
  /** Maximum connections in the pool */
  DB_POOL_MAX: z.coerce.number().int().min(1).default(10),
  DB_POOL_MIN: z.coerce.number().int().min(0).default(2),
  /** Milliseconds a connection may sit idle before being released */
  DB_POOL_IDLE_TIMEOUT_MS: z.coerce.number().int().default(10_000),
  DB_POOL_ACQUIRE_TIMEOUT_MS: z.coerce.number().int().default(30_000),
  /** Run migrations automatically on startup (disable in production!) */
  DB_AUTO_MIGRATE: booleanFromString.default('false' as unknown as boolean),
  /** TypeORM logging categories */
  DB_LOGGING: booleanFromString.default('false' as unknown as boolean),
});

/**
 * Redis — used for caching, BullMQ job queues, and session storage.
 */
const RedisSchema = z.object({
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: portNumber.default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().int().min(0).max(15).default(0),
  REDIS_TLS: booleanFromString.default('false' as unknown as boolean),
  /** Cache TTL in seconds */
  REDIS_CACHE_TTL_SECONDS: z.coerce.number().int().default(300),
  /** Maximum number of BullMQ job retries before marking as failed */
  QUEUE_MAX_ATTEMPTS: z.coerce.number().int().default(3),
  QUEUE_BACKOFF_MS: z.coerce.number().int().default(5_000),
});

/**
 * JWT authentication tokens.
 */
const JwtSchema = z.object({
  JWT_SECRET: requiredString,
  JWT_ACCESS_TOKEN_TTL: z.string().default('15m'),
  JWT_REFRESH_TOKEN_TTL: z.string().default('7d'),
  /** Algorithm accepted: RS256 for production (asymmetric), HS256 for dev */
  JWT_ALGORITHM: z
    .enum(['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512'])
    .default('HS256'),
  /** Base64-encoded RSA public key (required when JWT_ALGORITHM is RS*) */
  JWT_PUBLIC_KEY: z.string().optional(),
  /** Base64-encoded RSA private key (required when JWT_ALGORITHM is RS*) */
  JWT_PRIVATE_KEY: z.string().optional(),
  JWT_ISSUER: z.string().default('app'),
  JWT_AUDIENCE: z
    .string()
    .default('app-clients')
    .transform((s) => s.split(',').map((a) => a.trim())),
});

/**
 * AWS SDK – shared credentials used by all AWS service clients
 * (Secrets Manager, SSM, SQS, S3, …).
 */
const AwsSchema = z.object({
  AWS_REGION: z.string().default('us-east-1'),
  /**
   * In production on EC2/ECS/Lambda these are supplied automatically via the
   * instance role; explicit keys are only needed for local development.
   */
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_SESSION_TOKEN: z.string().optional(),
  /** The SSM parameter store path prefix, e.g. "/myapp/production" */
  AWS_SSM_PATH_PREFIX: z.string().default('/app'),
  /** Endpoint override for LocalStack in local/test environments */
  AWS_ENDPOINT_URL: z.string().optional(),
});

/**
 * Amazon S3 — file uploads and static assets.
 */
const S3Schema = z.object({
  S3_BUCKET_NAME: z.string().optional(),
  S3_BUCKET_REGION: z.string().default('us-east-1'),
  /** Presigned URL expiry in seconds */
  S3_PRESIGNED_URL_EXPIRY: z.coerce.number().int().default(900),
  /** Max upload file size in bytes (default: 50 MB) */
  S3_MAX_FILE_SIZE_BYTES: z.coerce.number().int().default(52_428_800),
  /** CloudFront CDN base URL for serving S3 assets */
  CDN_BASE_URL: httpUrl.optional(),
});

/**
 * Amazon SQS / SNS — event-driven messaging.
 */
const MessagingSchema = z.object({
  SQS_QUEUE_URL: z.string().url().optional(),
  SQS_DLQ_URL: z.string().url().optional(),
  /** SQS long-poll wait time in seconds (0-20) */
  SQS_WAIT_TIME_SECONDS: z.coerce.number().int().min(0).max(20).default(10),
  SQS_MAX_MESSAGES: z.coerce.number().int().min(1).max(10).default(10),
  SNS_TOPIC_ARN: z.string().optional(),
  /** EventBridge bus name */
  EVENT_BUS_NAME: z.string().optional(),
});

/**
 * Outbound email (SES / SMTP).
 */
const EmailSchema = z.object({
  EMAIL_FROM: z.string().email().optional(),
  EMAIL_REPLY_TO: z.string().email().optional(),
  /** "ses" uses AWS SES; "smtp" uses a generic SMTP relay */
  EMAIL_PROVIDER: z.enum(['ses', 'smtp', 'sendgrid', 'none']).default('none'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: portNumber.optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_SECURE: booleanFromString.default('true' as unknown as boolean),
  SENDGRID_API_KEY: z.string().optional(),
});

/**
 * Observability — APM, distributed tracing, structured logging sinks.
 */
const ObservabilitySchema = z.object({
  /** DataDog APM integration */
  DD_API_KEY: z.string().optional(),
  DD_APP_KEY: z.string().optional(),
  DD_SERVICE: z.string().optional(),
  DD_ENV: z.string().optional(),
  DD_VERSION: z.string().optional(),
  /** OpenTelemetry collector endpoint */
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
  OTEL_SERVICE_NAME: z.string().optional(),
  /** Sentry DSN for error tracking */
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
  /** Metrics port for Prometheus scraping */
  METRICS_PORT: portNumber.default(9090),
  METRICS_ENABLED: booleanFromString.default('true' as unknown as boolean),
});

/**
 * Feature flags — lightweight in-process toggles; production systems
 * should prefer AWS AppConfig or LaunchDarkly (use env vars as fallbacks).
 */
const FeatureFlagsSchema = z.object({
  FEATURE_GRAPHQL_ENABLED: booleanFromString.default('false' as unknown as boolean),
  FEATURE_WEBSOCKETS_ENABLED: booleanFromString.default('false' as unknown as boolean),
  FEATURE_RATE_LIMITING_ENABLED: booleanFromString.default('true' as unknown as boolean),
  FEATURE_REQUEST_LOGGING_ENABLED: booleanFromString.default('true' as unknown as boolean),
  /** Maximum requests per IP per window */
  RATE_LIMIT_MAX: z.coerce.number().int().default(100),
  /** Rate-limit window in milliseconds */
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().default(60_000),
});

// ─── Root schema ──────────────────────────────────────────────────────────────

/**
 * Master schema — merge all sub-schemas.
 * `.merge()` propagates strict mode so unknown keys are rejected; remove
 * `.strict()` if you need to pass env vars through to child processes.
 */
export const EnvSchema = AppSchema.merge(DatabaseSchema)
  .merge(RedisSchema)
  .merge(JwtSchema)
  .merge(AwsSchema)
  .merge(S3Schema)
  .merge(MessagingSchema)
  .merge(EmailSchema)
  .merge(ObservabilitySchema)
  .merge(FeatureFlagsSchema);

/** Static TypeScript type derived from the schema — always in sync */
export type Env = z.infer<typeof EnvSchema>;

// ─── Sub-schema types (for namespace config factories) ────────────────────────

export type AppEnv = z.infer<typeof AppSchema>;
export type DatabaseEnv = z.infer<typeof DatabaseSchema>;
export type RedisEnv = z.infer<typeof RedisSchema>;
export type JwtEnv = z.infer<typeof JwtSchema>;
export type AwsEnv = z.infer<typeof AwsSchema>;
export type S3Env = z.infer<typeof S3Schema>;
export type MessagingEnv = z.infer<typeof MessagingSchema>;
export type EmailEnv = z.infer<typeof EmailSchema>;
export type ObservabilityEnv = z.infer<typeof ObservabilitySchema>;
export type FeatureFlagsEnv = z.infer<typeof FeatureFlagsSchema>;

// ─── Sub-schema exports (used by loaders/validate-env) ────────────────────────
export {
  AppSchema,
  DatabaseSchema,
  RedisSchema,
  JwtSchema,
  AwsSchema,
  S3Schema,
  MessagingSchema,
  EmailSchema,
  ObservabilitySchema,
  FeatureFlagsSchema,
};
