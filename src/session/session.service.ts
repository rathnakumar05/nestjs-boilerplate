import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MoreThan } from 'typeorm';
import CryptoUtil from 'src/common/utils/crypto.util';
import { ISession } from './interfaces/session.interface';
import Session from 'src/entities/session.entity';
import User from 'src/entities/user.entity';
import { ActiveSessionDto } from 'src/session/dto/active-session.dto';
import errorCodes from 'src/common/constants/error-codes.const';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async getAllActiveSessions(publicId: string): Promise<ActiveSessionDto[]> {
    return await this.sessionsRepository.find({
      where: { publicId: publicId, isRevoked: false, expiresAt: MoreThan(new Date()) },
      select: ['id', 'ipAddress', 'userAgent', 'createdAt'],
    });
  }

  async getSessionByToken(refreshToken: string) {
    return await this.sessionsRepository.findOne({ where: { token: CryptoUtil.hashToken(refreshToken) } });
  }

  async generateNewSession(user: User, ipAddress: string, userAgent: string): Promise<ISession> {
    const activeSessions = await this.getAllActiveSessions(user.publicId);
    const maxActiveSessions = Number(this.configService.get<number>('MAX_ACTIVE_SESSIONS', 10));
    if (activeSessions.length >= maxActiveSessions) {
      const tempAccessToken = await this.jwtService.signAsync({
        sub: user.publicId,
        isTemp: true,
      });
      throw new ConflictException({
        errorCode: errorCodes.SessionLimitExceeds,
        accessToken: tempAccessToken,
      });
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.publicId,
    });

    const rawRefreshToken = CryptoUtil.generateRandomToken();
    const tokenHash = CryptoUtil.hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + Number(this.configService.get<number>('REFRESH_TOKEN_EXPIRES_IN')));

    const newSession = this.sessionsRepository.create({
      publicId: user.publicId,
      token: tokenHash,
      ipAddress,
      userAgent,
      expiresAt: expiresAt,
    });

    await this.sessionsRepository.save(newSession);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      refreshTokenExpiresAt: expiresAt,
    };
  }

  async updateSessionToken(session: Session, ipAddress: string, userAgent: string): Promise<ISession> {
    const accessToken = await this.jwtService.signAsync({
      sub: session.publicId,
    });
    const rawRefreshToken = CryptoUtil.generateRandomToken();
    const tokenHash = CryptoUtil.hashToken(rawRefreshToken);

    session.token = tokenHash;
    session.ipAddress = ipAddress;
    session.userAgent = userAgent;
    await this.sessionsRepository.save(session);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      refreshTokenExpiresAt: session.expiresAt,
    };
  }

  async revokeSessionByToken(refreshToken: string): Promise<void> {
    const session = await this.sessionsRepository.findOne({ where: { token: CryptoUtil.hashToken(refreshToken) } });
    if (!session) {
      throw new UnauthorizedException();
    }
    session.isRevoked = true;
    await this.sessionsRepository.save(session);
  }

  async revokeSession(id: string, publicId: string): Promise<void> {
    const session = await this.sessionsRepository.findOne({ where: { id, publicId } });
    if (!session) {
      throw new ForbiddenException();
    }

    session.isRevoked = true;
    await this.sessionsRepository.save(session);
  }

  async revokeAllSessions(publicId: string): Promise<void> {
    await this.sessionsRepository.update({ publicId, isRevoked: false }, { isRevoked: true });
  }
}
