import { ApiProperty } from '@nestjs/swagger';

export class ActiveSessionDto {
  @ApiProperty({ description: 'The unique identifier of the session.' })
  id: string;

  @ApiProperty({ type: 'string', description: 'The IP address from which the session was initiated.', nullable: true })
  ipAddress: string | null;

  @ApiProperty({ type: 'string', description: 'The user agent of the client.', nullable: true })
  userAgent: string | null;

  @ApiProperty({ description: 'The timestamp when the session was created.' })
  createdAt: Date;
}
