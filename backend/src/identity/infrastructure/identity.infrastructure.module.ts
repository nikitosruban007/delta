import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../prisma/prisma.module';
import { identityProviders } from './providers/identity.providers';
import { JwtStrategy } from './security/jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [...identityProviders, JwtStrategy],
  exports: [...identityProviders],
})
export class IdentityInfrastructureModule {}
