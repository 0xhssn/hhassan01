/**
 * s3.config.ts
 *
 * NestJS namespaced configuration for Amazon S3 file storage.
 *
 * Usage
 * ─────
 * constructor(
 *   @Inject(s3Config.KEY)
 *   private readonly s3: ConfigType<typeof s3Config>,
 * ) {}
 */

import { registerAs } from '@nestjs/config';
import { S3Schema } from '../env.schema';

export const s3Config = registerAs('s3', () => {
  const env = S3Schema.parse(process.env);

  return {
    bucketName: env.S3_BUCKET_NAME,
    bucketRegion: env.S3_BUCKET_REGION,
    presignedUrlExpirySeconds: env.S3_PRESIGNED_URL_EXPIRY,
    maxFileSizeBytes: env.S3_MAX_FILE_SIZE_BYTES,
    cdnBaseUrl: env.CDN_BASE_URL,

    /** Resolve a public asset URL via CDN or direct S3 */
    getAssetUrl(key: string): string {
      return env.CDN_BASE_URL
        ? `${env.CDN_BASE_URL}/${key}`
        : `https://${env.S3_BUCKET_NAME}.s3.${env.S3_BUCKET_REGION}.amazonaws.com/${key}`;
    },
  } as const;
});

export type S3Config = ReturnType<typeof s3Config>;
