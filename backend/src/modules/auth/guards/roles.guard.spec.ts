/* eslint-disable */
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RoleEnum } from '../../roles/schemas/role.schema';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockExecutionContext = (user?: any) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user,
        }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = mockExecutionContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true if requiredRoles array is empty', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    const context = mockExecutionContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user is not present in request', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([RoleEnum.ADMIN]);
    const context = mockExecutionContext(); // No user

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(
      'Access denied: User role not found',
    );
  });

  it('should throw ForbiddenException if user has no roleName', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([RoleEnum.ADMIN]);
    const context = mockExecutionContext({ id: '123' }); // user has no roleName

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(
      'Access denied: User role not found',
    );
  });

  it('should throw ForbiddenException if user role is not in requiredRoles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([RoleEnum.ADMIN]);
    const context = mockExecutionContext({ roleName: RoleEnum.STUDENT });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(
      'Access denied: Insufficient privileges',
    );
  });

  it('should return true if user role matches exactly one required role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([RoleEnum.ADMIN, RoleEnum.TPO]);
    const context = mockExecutionContext({ roleName: RoleEnum.ADMIN });

    expect(guard.canActivate(context)).toBe(true);
  });
});
