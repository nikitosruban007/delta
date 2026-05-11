import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AssignRoleUseCase } from '../../application/use-cases/assign-role.use-case';
import { RevokeRoleUseCase } from '../../application/use-cases/revoke-role.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AssignRoleDto } from '../dto/assign-role.dto';
import { PrismaService } from '../../../prisma/prisma.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly assignRoleUseCase: AssignRoleUseCase,
    private readonly revokeRoleUseCase: RevokeRoleUseCase,
    private readonly prisma: PrismaService,
  ) {}

  @Get('search')
  @ApiOperation({ summary: 'Search users by email, username or name (for team registration / judge picker)' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'limit', required: false })
  async search(@Query('q') q: string, @Query('limit') limit?: string) {
    const term = (q ?? '').trim();
    if (term.length < 2) return [];
    const take = Math.min(Math.max(Number(limit) || 10, 1), 25);
    const rows = await this.prisma.users.findMany({
      where: {
        status: 'active',
        OR: [
          { email: { contains: term, mode: 'insensitive' } },
          { username: { contains: term, mode: 'insensitive' } },
          { name: { contains: term, mode: 'insensitive' } },
        ],
      },
      select: { id: true, email: true, username: true, name: true, avatar_url: true },
      take,
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => ({
      id: String(r.id),
      email: r.email,
      username: r.username,
      name: r.name,
      avatarUrl: r.avatar_url,
    }));
  }

  @Post(':userId/roles')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  @ApiOperation({ summary: 'Assign role to user' })
  assignRole(
    @Param('userId') userId: string,
    @Body() dto: Omit<AssignRoleDto, 'userId'>,
    @Req() req: any,
  ) {
    return this.assignRoleUseCase.execute({
      userId,
      roleId: dto.roleId,
      assignedBy: req.user.id,
    });
  }

  @Delete(':userId/roles/:roleId')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  @ApiOperation({ summary: 'Revoke role from user' })
  revokeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.revokeRoleUseCase.execute({ userId, roleId });
  }
}
