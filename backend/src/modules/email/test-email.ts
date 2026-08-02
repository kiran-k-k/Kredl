import { NestFactory } from '@nestjs/core';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from './email.module';
import { EmailService } from './email.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    EmailModule,
  ],
})
class TestModule {}

async function bootstrap() {
  const logger = new Logger('EmailTest');
  try {
    const app = await NestFactory.createApplicationContext(TestModule);
    const emailService = app.get(EmailService);

    logger.log('Verifying connection...');
    const isConnected = await emailService.verifyConnection();
    logger.log(`Connection Verified: ${String(isConnected)}`);

    logger.log('Sending test email...');
    const response = await emailService.sendTemplateEmail({
      to: 'kendrek57@gmail.com',
      subject: 'Kredl Email Infrastructure Test',
      templateName: 'welcome',
      templateData: {
        name: 'Kredl Admin',
      },
    });

    logger.log('Email sent successfully!');
    logger.log(JSON.stringify(response, null, 2));

    await app.close();
  } catch (error) {
    logger.error('Error during email test:', error);
    process.exit(1);
  }
}

void bootstrap();
