/* eslint-disable */
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './database.config';
import { DATABASE_CONNECTION_NAME } from './database.constants';

export const databaseProviders = [
  MongooseModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: getDatabaseConfig,
    inject: [ConfigService],
  }),
];
