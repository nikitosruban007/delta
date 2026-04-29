import { ApiProperty } from '@nestjs/swagger';
import { MeResponseDto } from './me-response.dto';

export class AuthResponseDto {
  @ApiProperty({ type: MeResponseDto })
  user: MeResponseDto;

  @ApiProperty()
  accessToken: string;
}
