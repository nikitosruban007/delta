import { Body, Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssignRoleUseCase } from '../../application/use-cases/assign-role.use-case';
import { RevokeRoleUseCase } from '../../application/use-cases/revoke-role.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AssignRoleDto } from '../dto/assign-role.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly assignRoleUseCase: AssignRoleUseCase,
    private readonly revokeRoleUseCase: RevokeRoleUseCase,
  ) {}

  @Post(':userId/roles')
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
  @Roles('Admin')
  @ApiOperation({ summary: 'Revoke role from user' })
  revokeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.revokeRoleUseCase.execute({ userId, roleId });
  }
}
