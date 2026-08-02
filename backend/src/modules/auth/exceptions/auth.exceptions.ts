import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super('Invalid email or password', HttpStatus.UNAUTHORIZED);
  }
}

export class AccountLockedException extends HttpException {
  constructor() {
    super(
      'Account is temporarily locked due to too many failed attempts',
      HttpStatus.LOCKED,
    );
  }
}

export class EmailNotVerifiedException extends HttpException {
  constructor() {
    super('Please verify your email address to continue', HttpStatus.FORBIDDEN);
  }
}

export class AccountSuspendedException extends HttpException {
  constructor() {
    super(
      'Account has been suspended by an administrator',
      HttpStatus.FORBIDDEN,
    );
  }
}

export class InvalidTokenException extends HttpException {
  constructor() {
    super('Token is invalid or expired', HttpStatus.UNAUTHORIZED);
  }
}

export class TokenVersionMismatchException extends HttpException {
  constructor() {
    super(
      'Session expired due to a security update. Please log in again.',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class TokenRevokedException extends HttpException {
  constructor() {
    super(
      'Refresh token is invalid or has been revoked',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
