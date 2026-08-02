import { Logger } from '@nestjs/common';
import mongoose from 'mongoose';

export class DatabaseLogger {
  private readonly logger = new Logger('DatabaseLogger');

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    mongoose.connection.on('connected', () => {
      this.logger.log('MongoDB Connected');
    });

    mongoose.connection.on('disconnected', () => {
      this.logger.warn('MongoDB Disconnected');
    });

    mongoose.connection.on('error', (error: Error) => {
      this.logger.error(
        `MongoDB Connection Error: ${error.message}`,
        error.stack,
      );
    });
  }
}
