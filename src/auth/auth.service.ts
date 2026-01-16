import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SessionService } from '../session/session.service';
import User from '../entities/user.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ISession } from 'src/session/interfaces/session.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly sessionService: SessionService,
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    return existingUser;
  }

  async signup(signupDto: SignupDto): Promise<void> {
    const { email, password, firstName, lastName } = signupDto;

    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await this.hashPassword(password);
    const user = this.usersRepository.create({ email, password: hashedPassword, firstName, lastName });
    await this.usersRepository.save(user);
  }

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<ISession> {
    const { email, password } = loginDto;

    const existingUser = await this.getUserByEmail(email);
    if (!existingUser) {
      throw new ConflictException('Invalid email/password');
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      throw new ConflictException('Invalid email/password');
    }

    return await this.sessionService.generateNewSession(existingUser, ipAddress, userAgent);
  }

  async refresh(refreshToken: string, ipAddress: string, userAgent: string): Promise<ISession> {
    const session = await this.sessionService.getSessionByToken(refreshToken);
    if (!session) {
      throw new UnauthorizedException();
    }
    if (session.isRevoked === false && session.expiresAt < new Date()) {
      throw new UnauthorizedException();
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
      refreshTokenExpiresAt,
    } = await this.sessionService.updateSessionToken(session, ipAddress, userAgent);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      refreshTokenExpiresAt,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.sessionService.revokeSessionByToken(refreshToken);
  }
}
