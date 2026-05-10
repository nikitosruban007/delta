import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { PrismaService } from '../../../prisma/prisma.service';

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;
}

type AuthUser = { id: string; email: string; roles: string[]; permissions: string[] };

@ApiTags('auth')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('auth')
export class ProfileController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    const updated = await this.prisma.users.update({
      where: { id: Number(user.id) },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.avatarUrl !== undefined && { avatar_url: dto.avatarUrl }),
        updated_at: new Date(),
      },
      select: { id: true, name: true, email: true, avatar_url: true, status: true },
    });
    return {
      id: String(updated.id),
      name: updated.name,
      email: updated.email,
      avatarUrl: updated.avatar_url,
    };
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: AuthUser) {
    const found = await this.prisma.users.findUnique({
      where: { id: Number(user.id) },
      select: { id: true, name: true, email: true, avatar_url: true, status: true },
    });
    if (!found) return null;
    return {
      id: String(found.id),
      name: found.name,
      email: found.email,
      avatarUrl: found.avatar_url,
    };
  }
}
