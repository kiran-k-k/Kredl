/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { TokenService } from './services/token.service';
import { PasswordService } from './services/password.service';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UserStatus, AuthProvider } from '../users/schemas/user.schema';
import {
  InvalidCredentialsException,
  AccountLockedException,
  TokenRevokedException,
  TokenVersionMismatchException,
} from './exceptions/auth.exceptions';
import { EmailService } from '../email/email.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RolesService } from '../roles/roles.service';

// Mock dependencies
const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  incrementFailedLogin: jest.fn(),
  lockAccount: jest.fn(),
  resetFailedLogin: jest.fn(),
  findById: jest.fn(),
  updateRefreshToken: jest.fn(),
  clearRefreshToken: jest.fn(),
  verifyEmail: jest.fn(),
  setVerificationToken: jest.fn(),
  findByGoogleId: jest.fn(),
  linkGoogleAccount: jest.fn(),
  setPasswordResetToken: jest.fn(),
  findByPasswordResetToken: jest.fn(),
  updatePassword: jest.fn(),
  findByVerificationToken: jest.fn(),
  markEmailAsVerified: jest.fn(),
};

const mockRolesService = {
  findByName: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

const mockTokenService = {
  generateTokens: jest.fn(),
  verifyToken: jest.fn(),
};

const mockPasswordService = {
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  hashRefreshToken: jest.fn(),
  comparePassword: jest.fn(),
  generateRandomToken: jest.fn(),
  hashToken: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'FRONTEND_URL') return 'http://localhost:3000';
    return null;
  }),
};

const mockEmailService = {
  sendTemplateEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    // Reset all mocks
    Object.values(mockUsersService).forEach((mock) => mock.mockReset());
    Object.values(mockRolesService).forEach((mock) => mock.mockReset());
    Object.values(mockEventEmitter).forEach((mock) => mock.mockReset());
    Object.values(mockTokenService).forEach((mock) => mock.mockReset());
    Object.values(mockPasswordService).forEach((mock) => mock.mockReset());
    Object.values(mockEmailService).forEach((mock) => mock.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: RolesService, useValue: mockRolesService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: TokenService, useValue: mockTokenService },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'StrongPassword123!',
      role: 'Student',
    };

    it('should throw BadRequestException if user already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce({ id: '123' });

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
    });

    it('should hash password and create new user', async () => {
      mockRolesService.findByName.mockResolvedValueOnce({
        id: 'r1',
        name: 'Student',
      });
      mockUsersService.findByEmail.mockResolvedValueOnce(null);
      mockPasswordService.hashPassword.mockResolvedValueOnce('hashedPassword');
      mockUsersService.create.mockResolvedValueOnce({
        _id: 'new_id',
        email: registerDto.email,
        roleId: 'r1',
      });
      mockPasswordService.generateRandomToken.mockReturnValue('raw_token');
      mockPasswordService.hashToken.mockReturnValue('hashed_token');

      const result = await service.register(registerDto);

      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(
        registerDto.password,
      );
      expect(mockUsersService.create).toHaveBeenCalled();
      expect(result).toHaveProperty('message');
      // Should save the token for email verification
      expect(mockUsersService.setVerificationToken).toHaveBeenCalledWith(
        'new_id',
        'hashed_token',
        expect.any(Date),
      );
    });
    it('should throw BadRequestException if Default role is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce(null);
      mockRolesService.findByName.mockResolvedValueOnce(null);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateUser (Local Login)', () => {
    it('should return null if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce(null);
      const result = await service.validateUser('test@test.com', 'password');
      expect(result).toBeNull();
    });

    it('should throw InvalidCredentialsException for incorrect password and increment failed attempts', async () => {
      const mockUser = {
        status: 'ACTIVE',
        _id: '123',
        passwordHash: 'hashedPassword',
        status: 'ACTIVE',
        failedLoginAttempts: 0,
        status: UserStatus.ACTIVE,
      };
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      mockPasswordService.comparePassword.mockResolvedValueOnce(false);
      mockUsersService.incrementFailedLogin.mockResolvedValueOnce({
        ...mockUser,
        failedLoginAttempts: 1,
      });

      await expect(
        service.validateUser('test@test.com', 'wrongPassword'),
      ).rejects.toThrow(InvalidCredentialsException);
      expect(mockUsersService.incrementFailedLogin).toHaveBeenCalledWith('123');
    });

    it('should lockout account after MAX_FAILED_ATTEMPTS', async () => {
      const mockUser = {
        _id: '123',
        passwordHash: 'hashedPassword',
        failedLoginAttempts: 4, // 5th attempt will lock it
        status: UserStatus.ACTIVE,
      };
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      mockPasswordService.comparePassword.mockResolvedValueOnce(false);
      mockUsersService.incrementFailedLogin.mockResolvedValueOnce({
        ...mockUser,
        failedLoginAttempts: 5,
      });

      await expect(
        service.validateUser('test@test.com', 'wrongPassword'),
      ).rejects.toThrow(AccountLockedException);
      expect(mockUsersService.lockAccount).toHaveBeenCalledWith(
        '123',
        expect.any(Date),
      );
    });

    it('should throw AccountLockedException if account is locked', async () => {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + 10); // Locked for 10 more mins

      const mockUser = {
        _id: '123',
        passwordHash: 'hashedPassword',
        status: UserStatus.LOCKED,
        lockedUntil,
      };
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);

      await expect(
        service.validateUser('test@test.com', 'password'),
      ).rejects.toThrow(AccountLockedException);
    });

    it('should throw UnauthorizedException if account is inactive (deleted/deactivated)', async () => {
      const mockUser = {
        _id: '123',
        passwordHash: 'hash',
        status: UserStatus.DEACTIVATED,
      };
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      await expect(
        service.validateUser('test@test.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if account is pending verification', async () => {
      const mockUser = {
        _id: '123',
        passwordHash: 'hash',
        status: UserStatus.PENDING_VERIFICATION,
      };
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      await expect(
        service.validateUser('test@test.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if account is suspended', async () => {
      const mockUser = {
        _id: '123',
        passwordHash: 'hash',
        status: UserStatus.SUSPENDED,
      };
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      await expect(
        service.validateUser('test@test.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should auto-unlock account if lock duration expired', async () => {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() - 10); // Lock expired 10 mins ago

      const mockUser = {
        status: 'ACTIVE',
        _id: '123',
        passwordHash: 'hashedPassword',
        status: 'ACTIVE',
        status: UserStatus.LOCKED,
        lockedUntil,
        toObject: () => ({ _id: '123', passwordHash: 'hashedPassword' }),
      };
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      mockPasswordService.comparePassword.mockResolvedValueOnce(true); // Right password

      const result = await service.validateUser('test@test.com', 'password');
      expect(result).toBeDefined();
      expect(mockUsersService.resetFailedLogin).toHaveBeenCalledWith('123');
    });

    it('should return user object on successful login', async () => {
      const mockUser = {
        status: 'ACTIVE',
        _id: '123',
        passwordHash: 'hashedPassword',
        status: 'ACTIVE',
        status: UserStatus.ACTIVE,
      };
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      mockPasswordService.comparePassword.mockResolvedValueOnce(true);

      const result = await service.validateUser('test@test.com', 'password');
      expect(result).toBeDefined();
      expect(result._id).toEqual('123');
    });
  });

  describe('login', () => {
    it('should return tokens and save hashed refresh token', async () => {
      const mockUser = {
        status: 'ACTIVE',
        _id: '123',
        email: 'test@test.com',
        roleId: 'r1',
        tokenVersion: 1,
      };

      const mockTokens = { accessToken: 'access', refreshToken: 'refresh' };
      mockPasswordService.comparePassword.mockResolvedValueOnce(true);
      mockTokenService.generateTokens.mockResolvedValueOnce(mockTokens);
      mockPasswordService.hashPassword.mockResolvedValueOnce('hashedRefresh');
      mockRolesService.findById = jest
        .fn()
        .mockResolvedValueOnce({ _id: 'r1', name: 'Student' });

      const result = await service.login(mockUser as any);

      expect(result).toEqual(mockTokens);
      expect(mockTokenService.generateTokens).toHaveBeenCalled();
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        '123',
        'hashedRefresh',
      );
    });
  });

  describe('refreshToken', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findById.mockResolvedValueOnce(null);
      await expect(service.refreshToken('123', 'token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw TokenRevokedException if refresh token is invalid', async () => {
      const mockUser = {
        status: UserStatus.ACTIVE,
        _id: '123',
        hashedRefreshToken: 'hashedRefresh',
      };
      mockUsersService.findById.mockResolvedValueOnce(mockUser);
      mockPasswordService.comparePassword.mockResolvedValueOnce(false);

      await expect(service.refreshToken('123', 'wrongToken')).rejects.toThrow(
        TokenRevokedException,
      );
    });

    it('should generate new tokens and update refresh token on success', async () => {
      const mockUser = {
        status: 'ACTIVE',
        _id: '123',
        hashedRefreshToken: 'hashedRefresh',
        email: 'test@test.com',
        roleId: 'r1',
        status: UserStatus.ACTIVE,
        tokenVersion: 1,
      };
      mockUsersService.findById.mockResolvedValueOnce(mockUser);
      mockRolesService.findById = jest
        .fn()
        .mockResolvedValueOnce({ _id: 'r1', name: 'Student' });
      mockPasswordService.comparePassword.mockResolvedValueOnce(true);

      const mockTokens = {
        accessToken: 'newAccess',
        refreshToken: 'newRefresh',
      };
      mockTokenService.generateTokens.mockResolvedValueOnce(mockTokens);
      mockPasswordService.hashPassword.mockResolvedValueOnce(
        'newHashedRefresh',
      );
      mockTokenService.verifyToken.mockReturnValueOnce({ tokenVersion: 1 });

      const result = await service.refreshToken('123', 'validToken');

      expect(result).toEqual(mockTokens);
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        '123',
        'newHashedRefresh',
      );
    });
  });

  describe('logout', () => {
    it('should clear refresh token', async () => {
      await service.logout('123');
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        '123',
        null,
      );
    });
  });
  describe('googleLogin', () => {
    const googleProfile = {
      googleId: 'g123',
      email: 'test@google.com',
      firstName: 'Google',
      lastName: 'User',
      profileImage: 'http://image.com/img.png',
      verifiedEmail: true,
    };

    it('should login an existing Google user successfully', async () => {
      const mockUser = {
        _id: 'user1',
        email: 'test@google.com',
        googleId: 'g123',
        status: UserStatus.ACTIVE,
        roleId: 'r1',
        tokenVersion: 1,
      };
      mockUsersService.findByGoogleId.mockResolvedValueOnce(mockUser);
      mockRolesService.findById.mockResolvedValueOnce({
        _id: 'r1',
        name: 'Student',
      });
      mockTokenService.generateTokens.mockResolvedValueOnce({
        accessToken: 'a',
        refreshToken: 'r',
      });
      mockPasswordService.hashPassword.mockResolvedValueOnce('hashed_r');

      const result = await service.googleLogin(googleProfile);

      expect(mockUsersService.findByGoogleId).toHaveBeenCalledWith('g123');
      expect(result).toEqual({ accessToken: 'a', refreshToken: 'r' });
    });

    it('should link Google account if user exists with same email but no Google ID', async () => {
      const mockUser = {
        _id: 'user1',
        email: 'test@google.com',
        status: UserStatus.ACTIVE,
        roleId: 'r1',
        tokenVersion: 1,
      };
      const linkedUser = { ...mockUser, googleId: 'g123' };

      mockUsersService.findByGoogleId.mockResolvedValueOnce(null);
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      mockUsersService.linkGoogleAccount.mockResolvedValueOnce(linkedUser);
      mockRolesService.findById.mockResolvedValueOnce({
        _id: 'r1',
        name: 'Student',
      });
      mockTokenService.generateTokens.mockResolvedValueOnce({
        accessToken: 'a',
        refreshToken: 'r',
      });

      await service.googleLogin(googleProfile);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'test@google.com',
      );
      expect(mockUsersService.linkGoogleAccount).toHaveBeenCalledWith(
        'user1',
        'g123',
        'http://image.com/img.png',
      );
    });

    it('should throw UnauthorizedException if email is associated with a different Google account', async () => {
      const mockUser = {
        _id: 'user1',
        email: 'test@google.com',
        googleId: 'g-different',
        status: UserStatus.ACTIVE,
      };

      mockUsersService.findByGoogleId.mockResolvedValueOnce(null);
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);

      await expect(service.googleLogin(googleProfile)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should register a new user if not found by Google ID or Email', async () => {
      mockUsersService.findByGoogleId.mockResolvedValueOnce(null);
      mockUsersService.findByEmail.mockResolvedValueOnce(null);

      const studentRole = { _id: 'r1', name: 'Student' };
      mockRolesService.findByName.mockResolvedValueOnce(studentRole);

      const createdUser = {
        _id: 'user_new',
        email: 'test@google.com',
        googleId: 'g123',
        status: UserStatus.ACTIVE,
        roleId: 'r1',
        tokenVersion: 1,
      };
      mockUsersService.create.mockResolvedValueOnce(createdUser);
      mockRolesService.findById.mockResolvedValueOnce(studentRole);
      mockTokenService.generateTokens.mockResolvedValueOnce({
        accessToken: 'a',
        refreshToken: 'r',
      });

      await service.googleLogin(googleProfile);

      expect(mockUsersService.create).toHaveBeenCalledWith({
        firstName: 'Google',
        lastName: 'User',
        email: 'test@google.com',
        googleId: 'g123',
        profileImage: 'http://image.com/img.png',
        roleId: 'r1',
        status: UserStatus.ACTIVE,
        providers: [AuthProvider.GOOGLE],
        isEmailVerified: true,
      });
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'user.registered',
        createdUser,
      );
    });

    it('should throw BadRequestException if Default role is not found during registration', async () => {
      mockUsersService.findByGoogleId.mockResolvedValueOnce(null);
      mockUsersService.findByEmail.mockResolvedValueOnce(null);
      mockRolesService.findByName.mockResolvedValueOnce(null); // Role not found

      await expect(service.googleLogin(googleProfile)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const mockUser = {
        _id: 'user1',
        isEmailVerified: false,
        emailVerificationTokenExpiresAt: new Date(Date.now() + 10000), // future
      };
      mockPasswordService.hashToken.mockReturnValueOnce('hashed_token');
      mockUsersService.findByVerificationToken.mockResolvedValueOnce(mockUser);

      const result = await service.verifyEmail('raw_token');

      expect(mockUsersService.markEmailAsVerified).toHaveBeenCalledWith(
        'user1',
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'user.verified',
        mockUser,
      );
      expect(result).toEqual({
        message: 'Email verified successfully. You can now log in.',
      });
    });

    it('should throw BadRequestException if token is invalid', async () => {
      mockPasswordService.hashToken.mockReturnValueOnce('hashed_token');
      mockUsersService.findByVerificationToken.mockResolvedValueOnce(null);

      await expect(service.verifyEmail('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if email is already verified', async () => {
      const mockUser = { _id: 'user1', isEmailVerified: true };
      mockPasswordService.hashToken.mockReturnValueOnce('hashed_token');
      mockUsersService.findByVerificationToken.mockResolvedValueOnce(mockUser);

      await expect(service.verifyEmail('token')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if token is expired', async () => {
      const mockUser = {
        _id: 'user1',
        isEmailVerified: false,
        emailVerificationTokenExpiresAt: new Date(Date.now() - 10000), // past
      };
      mockPasswordService.hashToken.mockReturnValueOnce('hashed_token');
      mockUsersService.findByVerificationToken.mockResolvedValueOnce(mockUser);

      await expect(service.verifyEmail('token')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resendVerification', () => {
    it('should return a generic success message even if user not found (security)', async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce(null);

      const result = await service.resendVerification('test@test.com');

      expect(result).toEqual({
        message:
          'If your email is registered, a verification link has been sent.',
      });
    });

    it('should throw BadRequestException if email is already verified', async () => {
      const mockUser = { _id: 'user1', isEmailVerified: true };
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);

      await expect(service.resendVerification('test@test.com')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if account is suspended', async () => {
      const mockUser = {
        _id: 'user1',
        isEmailVerified: false,
        status: UserStatus.SUSPENDED,
      };
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);

      await expect(service.resendVerification('test@test.com')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should call sendVerificationEmail for valid user', async () => {
      const mockUser = {
        _id: 'user1',
        isEmailVerified: false,
        status: UserStatus.ACTIVE,
        email: 'test@test.com',
        firstName: 'John',
      };
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);

      // Spy on internal method sendVerificationEmail
      jest
        .spyOn(service as any, 'sendVerificationEmail')
        .mockResolvedValueOnce(undefined);

      const result = await service.resendVerification('test@test.com');

      expect(service['sendVerificationEmail']).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        message:
          'If your email is registered, a verification link has been sent.',
      });
    });
  });

  describe('forgotPassword', () => {
    it('should return success message if user is not found (security)', async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce(null);
      const result = await service.forgotPassword('test@test.com');
      expect(result).toEqual({
        message:
          'If your email is registered, a password reset link has been sent.',
      });
    });

    it('should return success message if user is suspended', async () => {
      const mockUser = { _id: '1', status: UserStatus.SUSPENDED };
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      const result = await service.forgotPassword('test@test.com');
      expect(result).toEqual({
        message:
          'If your email is registered, a password reset link has been sent.',
      });
    });

    it('should return success message if user does not use EMAIL provider', async () => {
      const mockUser = {
        _id: '1',
        status: UserStatus.ACTIVE,
        providers: [AuthProvider.GOOGLE],
      };
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      const result = await service.forgotPassword('test@test.com');
      expect(result).toEqual({
        message:
          'If your email is registered, a password reset link has been sent.',
      });
    });

    it('should generate token, save it, and send email', async () => {
      const mockUser = {
        _id: '1',
        status: UserStatus.ACTIVE,
        providers: [AuthProvider.EMAIL],
        email: 'test@test.com',
        firstName: 'John',
      };
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      mockPasswordService.generateRandomToken.mockReturnValueOnce('token123');
      mockPasswordService.hashToken.mockReturnValueOnce('hashed_token123');
      mockEmailService.sendTemplateEmail.mockResolvedValueOnce(undefined);

      const result = await service.forgotPassword('test@test.com');

      expect(mockUsersService.setPasswordResetToken).toHaveBeenCalledWith(
        '1',
        'hashed_token123',
        expect.any(Date),
      );
      expect(mockEmailService.sendTemplateEmail).toHaveBeenCalledWith({
        to: 'test@test.com',
        subject: 'Reset your Kredl password',
        templateName: 'password-reset',
        templateData: {
          name: 'John',
          resetUrl: expect.stringContaining('token=token123'),
        },
      });
      expect(result).toEqual({
        message:
          'If your email is registered, a password reset link has been sent.',
      });
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequestException if token is invalid or user not found', async () => {
      mockPasswordService.hashToken.mockReturnValueOnce('hashed');
      mockUsersService.findByPasswordResetToken.mockResolvedValueOnce(null);

      await expect(service.resetPassword('token', 'newPass')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if token is expired', async () => {
      const mockUser = {
        _id: '1',
        passwordResetTokenExpiresAt: new Date(Date.now() - 10000), // past
      };
      mockPasswordService.hashToken.mockReturnValueOnce('hashed');
      mockUsersService.findByPasswordResetToken.mockResolvedValueOnce(mockUser);

      await expect(service.resetPassword('token', 'newPass')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should hash new password, update user, and emit event', async () => {
      const mockUser = {
        _id: '1',
        passwordResetTokenExpiresAt: new Date(Date.now() + 10000), // future
      };
      mockPasswordService.hashToken.mockReturnValueOnce('hashed');
      mockUsersService.findByPasswordResetToken.mockResolvedValueOnce(mockUser);
      mockPasswordService.hashPassword.mockResolvedValueOnce('newHashedPass');

      const result = await service.resetPassword('token', 'newPass');

      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith('newPass');
      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(
        '1',
        'newHashedPass',
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'user.password_reset',
        mockUser,
      );
      expect(result).toEqual({
        message: 'Password has been reset successfully. You can now log in.',
      });
    });
  });
});
