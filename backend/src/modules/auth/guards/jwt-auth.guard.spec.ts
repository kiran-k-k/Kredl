/* eslint-disable */
import { JwtAuthGuard } from './jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  const mockExecutionContext = () =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;
    guard = new JwtAuthGuard(reflector);

    // Spy on the prototype's super method
    const baseGuard = Object.getPrototypeOf(Object.getPrototypeOf(guard));
    baseGuard.canActivate = jest.fn().mockReturnValue('super_called');
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if route is public', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);
    const context = mockExecutionContext();

    expect(guard.canActivate(context)).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  });

  it('should call super.canActivate if route is not public', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    const context = mockExecutionContext();

    const result = guard.canActivate(context);
    expect(result).toBe('super_called');
  });
});
