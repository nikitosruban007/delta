import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePermissionUseCase } from '../../application/use-cases/create-permission.use-case';
import { ListPermissionsUseCase } from '../../application/use-cases/list-permissions.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CreatePermissionDto } from '../dto/create-permission.dto';

@ApiTags('permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly createPermissionUseCase: CreatePermissionUseCase,
    private readonly listPermissionsUseCase: ListPermissionsUseCase,
  ) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({ summary: 'Create permission' })
  create(@Body() dto: CreatePermissionDto) {
    return this.createPermissionUseCase.execute(dto);
  }

  @Get()
  @Roles('Admin')
  @ApiOperation({ summary: 'List permissions' })
  list() {
    return this.listPermissionsUseCase.execute();
  }
}
