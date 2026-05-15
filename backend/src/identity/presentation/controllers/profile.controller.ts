import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  BadRequestException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
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

  @IsOptional()
  @IsString()
  @MaxLength(40)
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message:
      'username may contain only letters, digits, dot, dash and underscore',
  })
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  skills?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  company?: string;

  @IsOptional()
  @IsObject()
  socialLinks?: Record<string, string>;
}

type AuthUser = {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
};

const PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  username: true,
  bio: true,
  age: true,
  skills: true,
  company: true,
  social_links: true,
  avatar_url: true,
  status: true,
} as const;

function toProfileDto(row: {
  id: number;
  name: string;
  email: string;
  username: string | null;
  bio: string | null;
  age: number | null;
  skills: string | null;
  company: string | null;
  social_links: unknown;
  avatar_url: string | null;
}) {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    username: row.username,
    bio: row.bio,
    age: row.age,
    skills: row.skills,
    company: row.company,
    socialLinks: (row.social_links as Record<string, string> | null) ?? null,
    avatarUrl: row.avatar_url,
  };
}

@ApiTags('auth')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('auth')
export class ProfileController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
  ) {
    if (dto.username !== undefined) {
      const taken = await this.prisma.users.findFirst({
        where: { username: dto.username, NOT: { id: Number(user.id) } },
        select: { id: true },
      });
      if (taken) throw new BadRequestException('Username is already taken');
    }

    const updated = await this.prisma.users.update({
      where: { id: Number(user.id) },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.avatarUrl !== undefined && { avatar_url: dto.avatarUrl }),
        ...(dto.username !== undefined && { username: dto.username }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.age !== undefined && { age: dto.age }),
        ...(dto.skills !== undefined && { skills: dto.skills }),
        ...(dto.company !== undefined && { company: dto.company }),
        ...(dto.socialLinks !== undefined && {
          social_links: dto.socialLinks,
        }),
        updated_at: new Date(),
      },
      select: PROFILE_SELECT,
    });
    return toProfileDto(updated);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: AuthUser) {
    const found = await this.prisma.users.findUnique({
      where: { id: Number(user.id) },
      select: PROFILE_SELECT,
    });
    if (!found) return null;
    return toProfileDto(found);
  }

  @Post('profile/avatar')
  @ApiOperation({ summary: 'Upload avatar image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file (max 2MB, jpg/png only)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const user = req.user as AuthUser;
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `avatar-${user.id}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException('Only JPG and PNG files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Update user's avatar_url in database
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    await this.prisma.users.update({
      where: { id: Number(user.id) },
      data: { avatar_url: avatarUrl },
    });

    return { avatarUrl };
  }
}
