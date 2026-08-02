import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

async function bootstrap() {
  console.log('Initializing Kredl Application Context...');
  
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    console.log('====================================');
    console.log('STARTING INDEX SYNCHRONIZATION');
    console.log('====================================');

    const connection = app.get<Connection>(getConnectionToken());
    
    if (!connection) {
      throw new Error('Could not retrieve MongoDB connection');
    }

    const modelNames = connection.modelNames();
    console.log(`Found ${modelNames.length} registered models.`);

    for (const modelName of modelNames) {
      const model = connection.model(modelName);
      console.log(`Syncing indexes for ${modelName}...`);
      await model.syncIndexes();
      console.log(`✔ Synced indexes for ${modelName}`);
    }

    console.log('====================================');
    console.log('INDEX SYNCHRONIZATION COMPLETED SUCCESSFULLY');
    console.log('====================================');
  } catch (error) {
    console.error('INDEX SYNCHRONIZATION FAILED', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
