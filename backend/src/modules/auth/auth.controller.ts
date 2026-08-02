/* eslint-disable */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import type { UserDocument } from '../users/schemas/user.schema';

import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @CurrentUser() user: UserDocument,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(user);

    // Set HTTP-only cookie for refresh token
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { accessToken };
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentUser() user: { sub: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const incomingRefreshToken = req.cookies['refresh_token'] as string;

    const { accessToken, refreshToken } = await this.authService.refreshToken(
      user.sub,
      incomingRefreshToken,
    );

    // Set new HTTP-only cookie for rotated refresh token
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { accessToken };
  }

  @Post('logout')
  async logout(
    @CurrentUser() user: { sub: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('refresh_token');
    return this.authService.logout(user.sub);
  }

  @Public()
  @Post('verify-email')
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
  ) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Public()
  @Post('resend-verification')
  async resendVerification(
    @Body() resendDto: ResendVerificationDto,
  ) {
    return this.authService.resendVerification(resendDto.email);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Get('me')
  getProfile(@CurrentUser() user: unknown) {
    return user;
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async googleAuth() {
    // Initiates Google OAuth2 flow
  }

  @Public()
  @ApiExcludeEndpoint()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleAuthRedirect(
    @CurrentUser() profile: import('./auth.service').GoogleProfile,
    @Res({ passthrough: false }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.googleLogin(profile);

    // Set HTTP-only cookie for refresh token
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend with the short-lived access token in the URL fragment (hash)
    // This is safer than query params as fragments are not sent to the server in HTTP requests
    const frontendUrl =
      process.env.FRONTEND_OAUTH_REDIRECT_URL ||
      'http://localhost:3000/auth/success';
    res.redirect(`${frontendUrl}#token=${accessToken}`);
  }
}
