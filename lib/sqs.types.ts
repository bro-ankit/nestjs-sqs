import type { MessageAttributeValue } from '@aws-sdk/client-sqs';
import type { LoggerService, ModuleMetadata, Type } from '@nestjs/common';
import type { Consumer, ConsumerOptions, StopOptions } from 'sqs-consumer';
import type { Producer } from 'sqs-producer';

export interface SqsConsumerHandlerNameArgument {
  name?: string;
  configKey?: string
}

export type ProducerOptions = Parameters<typeof Producer.create>[0];
export type QueueName = string;
// Accepts a string for backward compatibility
export type QueueNameArgument = QueueName | SqsConsumerHandlerNameArgument;

export type SqsConsumerOptions = Omit<ConsumerOptions, 'handleMessage' | 'handleMessageBatch'> & {
  name: QueueName;
  stopOptions?: StopOptions;
};

export type SqsConsumerMapValues = {
  instance: Consumer;
  stopOptions: StopOptions;
};

export type SqsProducerOptions = ProducerOptions & {
  name: QueueName;
};

export interface SqsOptions {
  consumers?: SqsConsumerOptions[];
  producers?: SqsProducerOptions[];
  logger?: LoggerService;
  globalStopOptions?: StopOptions;
}

export interface SqsModuleOptionsFactory {
  createOptions(): Promise<SqsOptions> | SqsOptions;
}

export interface SqsModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<SqsModuleOptionsFactory>;
  useClass?: Type<SqsModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<SqsOptions> | SqsOptions;
  inject?: any[];
}

export interface Message<T = any> {
  id: string;
  body: T;
  groupId?: string;
  deduplicationId?: string;
  delaySeconds?: number;
  messageAttributes?: Record<string, MessageAttributeValue>;
}

export interface SqsMessageHandlerMeta {
  args: QueueNameArgument;
  batch?: boolean;
}

export interface SqsConsumerEventHandlerMeta {
  args: QueueNameArgument;
  eventName: string;
}
