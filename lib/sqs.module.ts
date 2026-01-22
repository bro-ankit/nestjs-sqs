import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import { SQS_OPTIONS } from './sqs.constants';
import { SqsService } from './sqs.service';
import { SqsModuleAsyncOptions, SqsModuleOptionsFactory, SqsOptions } from './sqs.types';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [DiscoveryModule, ConfigModule],
  providers: [SqsService],
  exports: [SqsService],
})
export class SqsModule {
  public static register(options: SqsOptions): DynamicModule {
    const sqsOptions: Provider = {
      provide: SQS_OPTIONS,
      useValue: options,
    };
    const sqsProvider: Provider = {
      provide: SqsService,
      useFactory: (_sqsOptions: SqsOptions, discover: DiscoveryService, configService: ConfigService) => {
        return new SqsService(options, discover, configService)
      },
      inject: [SQS_OPTIONS, DiscoveryService, ConfigService],
    };

    return {
      global: true,
      module: SqsModule,
      imports: [DiscoveryModule, ConfigModule],
      providers: [sqsOptions, sqsProvider],
      exports: [sqsProvider],
    };
  }

  public static registerAsync(options: SqsModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);
    const sqsProvider: Provider = {
      provide: SqsService,
      useFactory: (options: SqsOptions, discover: DiscoveryService, configService: ConfigService) => new SqsService(options, discover, configService),
      inject: [SQS_OPTIONS, DiscoveryService, ConfigService],
    };

    return {
      global: true,
      module: SqsModule,
      imports: [DiscoveryModule, ConfigModule, ...(options.imports ?? [])],
      providers: [...asyncProviders, sqsProvider],
      exports: [sqsProvider],
    };
  }

  private static createAsyncProviders(options: SqsModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<SqsModuleOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(options: SqsModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: SQS_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [(options.useClass || options.useExisting) as Type<SqsModuleOptionsFactory>];
    return {
      provide: SQS_OPTIONS,
      useFactory: async (optionsFactory: SqsModuleOptionsFactory) => await optionsFactory.createOptions(),
      inject,
    };
  }
}
