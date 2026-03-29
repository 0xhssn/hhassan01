/**
 * messaging.config.ts
 *
 * NestJS namespaced configuration for async messaging:
 * Amazon SQS, SNS, and EventBridge.
 *
 * Usage
 * ─────
 * constructor(
 *   @Inject(messagingConfig.KEY)
 *   private readonly messaging: ConfigType<typeof messagingConfig>,
 * ) {}
 */

import { registerAs } from '@nestjs/config';
import { MessagingSchema } from '../env.schema';

export const messagingConfig = registerAs('messaging', () => {
  const env = MessagingSchema.parse(process.env);

  return {
    sqs: {
      queueUrl: env.SQS_QUEUE_URL,
      dlqUrl: env.SQS_DLQ_URL,
      waitTimeSeconds: env.SQS_WAIT_TIME_SECONDS,
      maxMessages: env.SQS_MAX_MESSAGES,
    },
    sns: {
      topicArn: env.SNS_TOPIC_ARN,
    },
    eventBridge: {
      busName: env.EVENT_BUS_NAME,
    },
  } as const;
});

export type MessagingConfig = ReturnType<typeof messagingConfig>;
