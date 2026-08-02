import { JwtAuthGuard } from './src/modules/auth/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

const reflector = {
  getAllAndOverride: () => true
} as unknown as Reflector;

const guard = new JwtAuthGuard(reflector);
console.log(guard.canActivate({
  getHandler: () => {},
  getClass: () => {}
} as unknown as ExecutionContext));
