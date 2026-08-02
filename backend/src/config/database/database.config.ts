import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import {
  DATABASE_CONNECTION_TIMEOUT,
  DATABASE_RETRY_ATTEMPTS,
  DATABASE_RETRY_DELAY,
  DATABASE_SERVER_SELECTION_TIMEOUT,
} from './database.constants';
import { DatabaseLogger } from './database.logger';

export const getDatabaseConfig = (
  configService: ConfigService,
): MongooseModuleOptions => {
  // Initialize the database logger to setup mongoose connection event listeners
  new DatabaseLogger();

  const uri = configService.get<string>('MONGODB_URI');
  const dbName = configService.get<string>('DATABASE_NAME');

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  if (!dbName) {
    throw new Error('DATABASE_NAME environment variable is missing.');
  }

  return {
    uri,
    dbName,
    serverSelectionTimeoutMS: DATABASE_SERVER_SELECTION_TIMEOUT,
    connectTimeoutMS: DATABASE_CONNECTION_TIMEOUT,
    retryWrites: true,
    autoIndex: false,
    retryAttempts: DATABASE_RETRY_ATTEMPTS,
    retryDelay: DATABASE_RETRY_DELAY,
  };
};
