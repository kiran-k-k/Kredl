import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailProvider } from './email.provider';

@Module({
  imports: [ConfigModule],
  providers: [EmailProvider, EmailService],
  exports: [EmailService, EmailProvider],
})
export class EmailModule {}
