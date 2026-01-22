import { SetMetadata } from '@nestjs/common';
import { SQS_CONSUMER_EVENT_HANDLER, SQS_CONSUMER_METHOD } from './sqs.constants';
import { QueueNameArgument } from './sqs.types';


export const SqsMessageHandler = (args: QueueNameArgument, batch?: boolean) => SetMetadata(SQS_CONSUMER_METHOD, { args, batch });
export const SqsConsumerEventHandler = (args: QueueNameArgument, eventName: string) =>
  SetMetadata(SQS_CONSUMER_EVENT_HANDLER, { args, eventName });
