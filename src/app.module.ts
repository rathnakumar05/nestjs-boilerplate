import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { AuthGuard } from './auth/guards/auth.guard';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import dbConfig from './config/database.config';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      load: [dbConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return config.get('database')!;
      },
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY')!,
        signOptions: {
          expiresIn: config.get<StringValue>('JWT_EXPIRES_IN'),
        },
      }),
    }),
    AuthModule,
    SessionModule,
  ],
})
export class AppModule {}
