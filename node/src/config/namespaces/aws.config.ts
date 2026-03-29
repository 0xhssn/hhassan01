/**
 * aws.config.ts
 *
 * NestJS namespaced configuration for AWS SDK client defaults.
 *
 * This is the shared configuration injected into every AWS service client
 * (SecretsManagerClient, SSMClient, S3Client, SQSClient, …).
 *
 * In ECS / Lambda: credentials are resolved automatically from the IAM role;
 * explicit ACCESS_KEY_ID / SECRET_ACCESS_KEY are only needed locally.
 *
 * Usage
 * ─────
 * constructor(
 *   @Inject(awsConfig.KEY)
 *   private readonly aws: ConfigType<typeof awsConfig>,
 * ) {}
 */

import { registerAs } from '@nestjs/config';
import { AwsSchema } from '../env.schema';

export const awsConfig = registerAs('aws', () => {
  const env = AwsSchema.parse(process.env);

  const credentials =
    env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
          sessionToken: env.AWS_SESSION_TOKEN,
        }
      : undefined; // fall back to default provider chain (IAM role)

  return {
    region: env.AWS_REGION,
    credentials,
    ssmPathPrefix: env.AWS_SSM_PATH_PREFIX,
    endpointUrl: env.AWS_ENDPOINT_URL, // LocalStack override

    /**
     * Base AWS SDK client configuration object.
     * Spread this into any AWS service client constructor:
     *   new S3Client({ ...aws.sdkConfig, ... })
     */
    get sdkConfig() {
      return {
        region: env.AWS_REGION,
        ...(credentials && { credentials }),
        ...(env.AWS_ENDPOINT_URL && { endpoint: env.AWS_ENDPOINT_URL }),
      } as const;
    },
  } as const;
});

export type AwsConfig = ReturnType<typeof awsConfig>;
