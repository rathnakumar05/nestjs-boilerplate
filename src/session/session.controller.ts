import { Controller, Get, UseGuards, Req, Delete, Param, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { SessionService } from './session.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import type { IAuthRequest } from 'src/auth/interfaces/auth.interface';
import { HasTempAccess } from 'src/common/decorators/temp-access.decorator';
import { ActiveSessionDto } from './dto/active-session.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('session')
@UseGuards(AuthGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @ApiOperation({ summary: 'get all active sessions' })
  @ApiResponse({
    status: 200,
    description: 'The list of active sessions.',
    type: ActiveSessionDto,
    isArray: true,
  })
  @HasTempAccess()
  @Get('active')
  async getAllActiveSessions(@Req() req: IAuthRequest): Promise<ActiveSessionDto[]> {
    const publicId = req.user!.sub;
    return await this.sessionService.getAllActiveSessions(publicId);
  }

  @ApiOperation({ summary: 'revoke session by id' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'The session has been successfully revoked.' })
  @HasTempAccess()
  @Delete('revoke/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeSession(@Req() req: IAuthRequest, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const publicId = req.user!.sub;
    return await this.sessionService.revokeSession(id, publicId);
  }

  @ApiOperation({ summary: 'revoke all sessions' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'The sessions have been successfully revoked.' })
  @HasTempAccess()
  @Delete('revoke-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeAllSessions(@Req() req: IAuthRequest): Promise<void> {
    const publicId = req.user!.sub;
    await this.sessionService.revokeAllSessions(publicId);
  }
}
