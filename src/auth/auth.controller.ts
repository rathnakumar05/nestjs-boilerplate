import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Ip,
  Headers,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiConflictResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import AuthResponseDto from './dto/auth-response.dto';
import type { IAuthRequest } from './interfaces/auth.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  private setRefreshTokenCookie(response: Response, token: string, expires: Date) {
    response.cookie('refresh_token', token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production' ? true : false,
      sameSite: 'none',
      path: '/',
      expires: expires,
    });
  }

  @ApiOperation({ summary: 'signup user with email and password' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
  @ApiResponse({ status: 409, description: 'User with this email already exists.' })
  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto): Promise<void> {
    return await this.authService.signup(signupDto);
  }

  @ApiOperation({ summary: 'login user with email and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has been successfully logged in.',
    type: AuthResponseDto,
  })
  @ApiConflictResponse({
    description: 'Invalid email/password or Active session exceeds limit',
    content: {
      'application/json': {
        examples: {
          invalidEmailOrPassword: {
            summary: 'Invalid email or password',
            value: {
              statusCode: HttpStatus.CONFLICT,
              message: 'Invalid email/password',
            },
          },
          activeSessionExceedsLimit: {
            summary: 'Active session exceeds limit',
            value: {
              errorCode: 'SESSION_LIMIT_EXCEEDS',
              accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lI09',
            },
          },
        },
      },
    },
  })
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
    @Ip() ipAddress: string | undefined = '',
    @Headers('user-agent') userAgent: string | undefined = ''
  ): Promise<AuthResponseDto> {
    const { accessToken, refreshToken, refreshTokenExpiresAt } = await this.authService.login(
      loginDto,
      ipAddress,
      userAgent
    );

    this.setRefreshTokenCookie(response, refreshToken, refreshTokenExpiresAt);

    return { accessToken };
  }

  @ApiOperation({ summary: 'refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The token has been successfully refreshed.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @Public()
  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: IAuthRequest,
    @Res({ passthrough: true }) response: Response,
    @Ip() ipAddress: string | undefined = '',
    @Headers('user-agent') userAgent: string | undefined = ''
  ): Promise<AuthResponseDto> {
    const oldRefreshToken = request.cookies['refresh_token'];
    if (!oldRefreshToken) {
      throw new UnauthorizedException();
    }
    const { accessToken, refreshToken, refreshTokenExpiresAt } = await this.authService.refresh(
      oldRefreshToken,
      ipAddress,
      userAgent
    );

    this.setRefreshTokenCookie(response, refreshToken, refreshTokenExpiresAt);

    return { accessToken };
  }

  @ApiOperation({ summary: 'logout user' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: IAuthRequest, @Res({ passthrough: true }) response: Response): Promise<void> {
    const refreshToken = request.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    await this.authService.logout(refreshToken);

    response.clearCookie('refresh_token');
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('test')
  @HttpCode(HttpStatus.OK)
  test(): string {
    return 'test';
  }
}
