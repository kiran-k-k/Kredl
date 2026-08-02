/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { UserDocument } from '../users/schemas/user.schema';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  refreshToken: jest.fn(),
  logout: jest.fn(),
  verifyEmail: jest.fn(),
  resendVerification: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  googleLogin: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    Object.values(mockAuthService).forEach((mock) => mock.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password',
        role: 'Student',
      };
      mockAuthService.register.mockResolvedValueOnce({ message: 'Success' });
      const result = await controller.register(dto);
      expect(result).toEqual({ message: 'Success' });
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should set refresh token cookie and return access token', async () => {
      const mockUser = { _id: '123' } as UserDocument;
      const mockRes = { cookie: jest.fn() } as unknown as Response;

      mockAuthService.login.mockResolvedValueOnce({
        accessToken: 'access',
        refreshToken: 'refresh',
      });

      const result = await controller.login(mockUser, mockRes);

      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
        }),
      );
      expect(result).toEqual({ accessToken: 'access' });
    });
  });

  describe('refresh', () => {
    it('should verify incoming cookie, rotate tokens, and set new cookie', async () => {
      const mockUser = { sub: '123' };
      const mockReq = {
        cookies: { refresh_token: 'oldRefresh' },
      } as unknown as Request;
      const mockRes = { cookie: jest.fn() } as unknown as Response;

      mockAuthService.refreshToken.mockResolvedValueOnce({
        accessToken: 'newAccess',
        refreshToken: 'newRefresh',
      });

      const result = await controller.refresh(mockUser, mockReq, mockRes);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
        '123',
        'oldRefresh',
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'newRefresh',
        expect.any(Object),
      );
      expect(result).toEqual({ accessToken: 'newAccess' });
    });
  });

  describe('logout', () => {
    it('should clear cookie and call authService.logout', async () => {
      const mockUser = { sub: '123' };
      const mockRes = { clearCookie: jest.fn() } as unknown as Response;

      mockAuthService.logout.mockResolvedValueOnce({ message: 'Logged out' });

      const result = await controller.logout(mockUser, mockRes);

      expect(mockRes.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(mockAuthService.logout).toHaveBeenCalledWith('123');
      expect(result).toEqual({ message: 'Logged out' });
    });
  });

  describe('forgotPassword / resetPassword', () => {
    it('should call authService for forgotPassword', async () => {
      const dto = { email: 'test@example.com' };
      mockAuthService.forgotPassword.mockResolvedValueOnce({
        message: 'Email sent',
      });
      const result = await controller.forgotPassword(dto);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(dto.email);
      expect(result).toEqual({ message: 'Email sent' });
    });

    it('should call authService for resetPassword', async () => {
      const dto = { token: 'token', newPassword: 'newPassword' };
      mockAuthService.resetPassword.mockResolvedValueOnce({
        message: 'Password reset',
      });
      const result = await controller.resetPassword(dto);
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        dto.token,
        dto.newPassword,
      );
      expect(result).toEqual({ message: 'Password reset' });
    });
  });

  describe('googleAuth', () => {
    it('should have a googleAuth method that initiates flow', async () => {
      // It's an empty method used by passport, just check it exists
      expect(controller.googleAuth).toBeDefined();
      await controller.googleAuth();
    });

    it('should handle googleAuthRedirect and set cookie', async () => {
      const mockProfile = {
        googleId: 'g123',
        email: 'test@google.com',
        firstName: 'John',
        lastName: 'Doe',
        profileImage: 'img.png',
        verifiedEmail: true,
      };
      const mockRes = {
        cookie: jest.fn(),
        redirect: jest.fn(),
      } as unknown as Response;

      mockAuthService.googleLogin.mockResolvedValueOnce({
        accessToken: 'access',
        refreshToken: 'refresh',
      });

      // We need to set a dummy process.env.FRONTEND_URL just for the test
      const originalEnv = process.env.FRONTEND_URL;
      process.env.FRONTEND_URL = 'http://localhost:3000';

      await controller.googleAuthRedirect(mockProfile, mockRes);

      expect(mockAuthService.googleLogin).toHaveBeenCalledWith(mockProfile);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh',
        expect.objectContaining({ httpOnly: true, sameSite: 'strict' }),
      );
      expect(mockRes.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/auth/success#token=access',
      );

      process.env.FRONTEND_URL = originalEnv; // restore
    });
  });
});
