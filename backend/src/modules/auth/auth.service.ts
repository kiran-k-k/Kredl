/* eslint-disable */
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
  BadGatewayException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { RoleEnum } from '../roles/schemas/role.schema';
import { RegisterDto } from './dto/register.dto';
import {
  UserDocument,
  AuthProvider,
  UserStatus,
} from '../users/schemas/user.schema';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import {
  AccountLockedException,
  InvalidCredentialsException,
  TokenRevokedException,
  TokenVersionMismatchException,
} from './exceptions/auth.exceptions';
import { SECURITY_CONFIG } from '../../config/security.config';

export interface GoogleProfile {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  verifiedEmail: boolean;
}

import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly eventEmitter: EventEmitter2,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(
      registerDto.email.toLowerCase(),
    );
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const studentRole = await this.rolesService.findByName(RoleEnum.STUDENT);
    if (!studentRole) {
      throw new BadRequestException('Default role not found');
    }

    const passwordHash = await this.passwordService.hashPassword(
      registerDto.password,
    );

    const isDevelopment = process.env.NODE_ENV !== 'production';

    const newUser = await this.usersService.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      passwordHash,
      roleId: studentRole._id,
      status: isDevelopment ? UserStatus.ACTIVE : UserStatus.PENDING_VERIFICATION,
      isEmailVerified: isDevelopment,
      providers: [AuthProvider.EMAIL],
    });

    this.eventEmitter.emit('user.registered', newUser);

    // Send the verification email in the background or await it based on preference
    // Awaiting ensures we don't say successful if email fails completely
    if (!newUser.isEmailVerified) {
      await this.sendVerificationEmail(newUser);
    }

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }

  async inviteUser(email: string, roleName: string) {
    const existingUser = await this.usersService.findByEmail(
      email.toLowerCase(),
    );
    if (existingUser && existingUser.status !== UserStatus.DELETED) {
      throw new BadRequestException('User with this email already exists');
    }

    const role = await this.rolesService.findByName(roleName as RoleEnum);
    if (!role) {
      throw new BadRequestException('Role not found');
    }

    const crypto = require('crypto');
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const passwordHash = await this.passwordService.hashPassword(
      tempPassword,
    );

    let newUser;
    if (existingUser && existingUser.status === UserStatus.DELETED) {
      newUser = await this.usersService.reactivateUser(existingUser._id as any, {
        passwordHash,
        roleId: role._id,
        firstName: 'Invited',
        lastName: 'User',
        isEmailVerified: true,
      });
      if (!newUser) throw new BadRequestException('Failed to reactivate user');
    } else {
      newUser = await this.usersService.create({
        firstName: 'Invited',
        lastName: 'User',
        email: email.toLowerCase(),
        passwordHash,
        roleId: role._id,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        providers: [AuthProvider.EMAIL],
      });
    }

    const loginUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    ) + '/auth/login';

    try {
      await this.emailService.sendTemplateEmail({
        to: newUser.email,
        subject: 'You have been invited to Kredl',
        templateName: 'invite',
        templateData: {
          email: newUser.email,
          password: tempPassword,
          role: roleName,
          loginUrl,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send invite email to ${email}`, error);
      // We don't throw here to avoid failing the invitation creation, 
      // but in a production app we might queue this or handle it properly.
    }

    return {
      message: 'Invitation sent successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        tempPassword,
      },
    };
  }

  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email.toLowerCase());

    if (!user || !user.passwordHash) {
      return null;
    }

    if (
      user.status === UserStatus.DELETED ||
      user.status === UserStatus.DEACTIVATED
    ) {
      throw new UnauthorizedException('Account is inactive');
    }

    if (user.status === UserStatus.PENDING_VERIFICATION) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account suspended by admin');
    }

    if (user.status === UserStatus.LOCKED && user.lockedUntil) {
      if (new Date() < user.lockedUntil) {
        throw new AccountLockedException();
      } else {
        await this.usersService.resetFailedLogin(user._id.toString());
        user.failedLoginAttempts = 0;
        user.status = UserStatus.ACTIVE;
      }
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      pass,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      const updatedUser = await this.usersService.incrementFailedLogin(
        user._id.toString(),
      );
      if (
        updatedUser &&
        updatedUser.failedLoginAttempts >=
          SECURITY_CONFIG.ACCOUNT_LOCKOUT.MAX_FAILED_ATTEMPTS
      ) {
        const lockUntil = new Date(
          Date.now() + SECURITY_CONFIG.ACCOUNT_LOCKOUT.DURATION_MS,
        );
        await this.usersService.lockAccount(user._id.toString(), lockUntil);
        this.eventEmitter.emit('user.account_locked', updatedUser);
        throw new AccountLockedException();
      }
      throw new InvalidCredentialsException();
    }

    await this.usersService.resetFailedLogin(user._id.toString());
    return user;
  }

  async login(user: UserDocument) {
    const role = await this.rolesService.findById(user.roleId.toString());
    const roleName = role ? role.name : 'Unknown';

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      roleId: user.roleId.toString(),
      roleName: roleName,
      tokenVersion: user.tokenVersion,
    };

    const tokens = await this.tokenService.generateTokens(payload);
    const hashedRt = await this.passwordService.hashPassword(
      tokens.refreshToken,
    );
    await this.usersService.updateRefreshToken(user._id.toString(), hashedRt);

    this.eventEmitter.emit('user.logged_in', user);

    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  async refreshToken(userId: string, rt: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    if (!user.hashedRefreshToken) {
      throw new TokenRevokedException();
    }

    const isRefreshTokenValid = await this.passwordService.comparePassword(
      rt,
      user.hashedRefreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new TokenRevokedException();
    }

    const decoded = this.tokenService.verifyToken(rt, true);
    if (decoded.tokenVersion !== user.tokenVersion) {
      throw new TokenVersionMismatchException();
    }

    const role = await this.rolesService.findById(user.roleId.toString());
    const roleName = role ? role.name : 'Unknown';

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      roleId: user.roleId.toString(),
      roleName: roleName,
      tokenVersion: user.tokenVersion,
    };

    const tokens = await this.tokenService.generateTokens(payload);
    const hashedRt = await this.passwordService.hashPassword(
      tokens.refreshToken,
    );
    await this.usersService.updateRefreshToken(user._id.toString(), hashedRt);

    this.logger.log(`Tokens rotated for user ${user._id}`);

    return tokens;
  }

  async googleLogin(profile: GoogleProfile) {
    let user = await this.usersService.findByGoogleId(profile.googleId);

    if (!user) {
      // Check if user exists by email
      user = await this.usersService.findByEmail(profile.email.toLowerCase());

      if (user) {
        // Explicitly check for linking conflict: if it has another google ID (rare but possible)
        if (user.googleId && user.googleId !== profile.googleId) {
          this.logger.warn(
            `Google login failed: Email ${profile.email} is associated with a different Google account.`,
          );
          throw new UnauthorizedException(
            'This email is already associated with a different Google account.',
          );
        }

        this.logger.log(`Linking Google account to existing user ${user._id}`);
        // Link existing account with Google
        user = await this.usersService.linkGoogleAccount(
          user._id.toString(),
          profile.googleId,
          profile.profileImage,
        );
      } else {
        this.logger.log(
          `Registering new user via Google OAuth: ${profile.email}`,
        );
        // Create a new user
        const studentRole = await this.rolesService.findByName(
          RoleEnum.STUDENT,
        );
        if (!studentRole) {
          throw new BadRequestException('Default role not found');
        }

        user = await this.usersService.create({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email.toLowerCase(),
          googleId: profile.googleId,
          profileImage: profile.profileImage,
          roleId: studentRole._id,
          status: UserStatus.ACTIVE, // Auto-activate
          providers: [AuthProvider.GOOGLE], // Set provider array
          isEmailVerified: profile.verifiedEmail,
        });

        this.eventEmitter.emit('user.registered', user);
      }
    } else {
      this.logger.log(`Successful Google login for existing user ${user._id}`);
    }

    if (!user) {
      throw new UnauthorizedException('Authentication failed');
    }

    if (
      user.status === UserStatus.DELETED ||
      user.status === UserStatus.DEACTIVATED
    ) {
      throw new UnauthorizedException('Account is inactive');
    }
    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account suspended by admin');
    }
    if (
      user.status === UserStatus.LOCKED &&
      user.lockedUntil &&
      new Date() < user.lockedUntil
    ) {
      throw new AccountLockedException();
    }

    // Reset failed login just in case it was a local account that was locked
    await this.usersService.resetFailedLogin(user._id.toString());
    this.eventEmitter.emit('user.logged_in', user);

    const role = await this.rolesService.findById(user.roleId.toString());
    const roleName = role ? role.name : 'Unknown';

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      roleId: user.roleId.toString(),
      roleName: roleName,
      tokenVersion: user.tokenVersion,
    };

    const tokens = await this.tokenService.generateTokens(payload);
    const hashedRt = await this.passwordService.hashPassword(
      tokens.refreshToken,
    );
    await this.usersService.updateRefreshToken(user._id.toString(), hashedRt);

    return tokens;
  }

  async sendVerificationEmail(user: UserDocument) {
    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const token = this.passwordService.generateRandomToken();
    const tokenHash = this.passwordService.hashToken(token);

    // Set expiry to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.usersService.setVerificationToken(
      user._id.toString(),
      tokenHash,
      expiresAt,
    );

    const frontendUrl =
      this.configService.get<string>('FRONTEND_VERIFY_EMAIL_URL') ||
      'http://localhost:3000/auth/verify';
    const verificationUrl = `${frontendUrl}?token=${token}`;

    try {
      await this.emailService.sendTemplateEmail({
        to: user.email,
        subject: 'Verify your email for Kredl',
        templateName: 'email-verification',
        templateData: {
          name: user.firstName,
          verificationUrl,
        },
      });
      this.logger.log(`Verification email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${user.email}`, error);
      // We will not throw here to allow registration to succeed even if email fails (e.g. missing SMTP credentials)
      this.logger.warn('Registration succeeded, but verification email failed to send.');
    }
  }

  async verifyEmail(token: string) {
    const tokenHash = this.passwordService.hashToken(token);
    const user = await this.usersService.findByVerificationToken(tokenHash);

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (
      !user.emailVerificationTokenExpiresAt ||
      user.emailVerificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Verification token has expired');
    }

    await this.usersService.markEmailAsVerified(user._id.toString());

    this.eventEmitter.emit('user.verified', user);
    this.logger.log(`User ${user._id} email verified successfully`);

    return { message: 'Email verified successfully. You can now log in.' };
  }

  async resendVerification(email: string) {
    const user = await this.usersService.findByEmail(email.toLowerCase());

    if (!user) {
      // Return success to prevent email enumeration
      return {
        message:
          'If your email is registered, a verification link has been sent.',
      };
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (
      user.status === UserStatus.SUSPENDED ||
      user.status === UserStatus.DELETED ||
      user.status === UserStatus.DEACTIVATED
    ) {
      throw new BadRequestException(
        'Cannot send verification email for this account',
      );
    }

    await this.sendVerificationEmail(user);

    return {
      message:
        'If your email is registered, a verification link has been sent.',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email.toLowerCase());

    if (!user) {
      // Return success to prevent email enumeration
      return {
        message:
          'If your email is registered, a password reset link has been sent.',
      };
    }

    if (
      user.status === UserStatus.SUSPENDED ||
      user.status === UserStatus.DELETED ||
      user.status === UserStatus.DEACTIVATED
    ) {
      return {
        message:
          'If your email is registered, a password reset link has been sent.',
      };
    }



    const token = this.passwordService.generateRandomToken();
    const tokenHash = this.passwordService.hashToken(token);

    const expiresAt = new Date();
    expiresAt.setHours(
      expiresAt.getHours() + SECURITY_CONFIG.TOKENS.PASSWORD_RESET_HOURS,
    );

    await this.usersService.setPasswordResetToken(
      user._id.toString(),
      tokenHash,
      expiresAt,
    );

    const frontendUrl =
      this.configService.get<string>('FRONTEND_RESET_PASSWORD_URL') ||
      'http://localhost:3000/auth/reset-password';
    const resetUrl = `${frontendUrl}?token=${token}`;

    try {
      await this.emailService.sendTemplateEmail({
        to: user.email,
        subject: 'Reset your Kredl password',
        templateName: 'password-reset',
        templateData: {
          name: user.firstName,
          resetUrl,
        },
      });
      this.logger.log(`Password reset email sent to ${user.email}`);
    } catch (error: any) {
      this.logger.error(`Failed to send password reset email to ${user.email}`, error);
      // For debugging: throw the error so the frontend displays the exact Resend error
      throw new BadRequestException(`Email delivery failed: ${error.message}`);
    }

    return {
      message:
        'If your email is registered, a password reset link has been sent.',
      ...(process.env.NODE_ENV !== 'production' ? { devResetUrl: resetUrl } : {}),
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.passwordService.hashToken(token);
    const user = await this.usersService.findByPasswordResetToken(tokenHash);

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    if (
      !user.passwordResetTokenExpiresAt ||
      user.passwordResetTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Password reset token has expired');
    }

    const passwordHash = await this.passwordService.hashPassword(newPassword);
    await this.usersService.updatePassword(user._id.toString(), passwordHash);

    this.eventEmitter.emit('user.password_reset', user);
    this.logger.log(`User ${user._id} reset their password successfully`);

    return {
      message: 'Password has been reset successfully. You can now log in.',
    };
  }

  async generateAdminResetLink(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const token = this.passwordService.generateRandomToken();
    const tokenHash = this.passwordService.hashToken(token);

    const expiresAt = new Date();
    expiresAt.setHours(
      expiresAt.getHours() + SECURITY_CONFIG.TOKENS.PASSWORD_RESET_HOURS,
    );

    await this.usersService.setPasswordResetToken(
      user._id.toString(),
      tokenHash,
      expiresAt,
    );

    const frontendUrl =
      this.configService.get<string>('FRONTEND_RESET_PASSWORD_URL') ||
      'http://localhost:3000/reset-password';
    const resetUrl = `${frontendUrl}?token=${token}`;

    return {
      message: 'Reset link generated successfully',
      resetUrl,
    };
  }
}
