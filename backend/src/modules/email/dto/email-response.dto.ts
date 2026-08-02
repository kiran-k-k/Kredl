export class EmailResponseDto {
  success: boolean;
  messageId?: string;
  provider: string;
  timestamp: string;
  error?: string;
}
