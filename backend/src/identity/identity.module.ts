import { Module } from '@nestjs/common';
import { IdentityInfrastructureModule } from './infrastructure/identity.infrastructure.module';
import { IdentityPresentationModule } from './presentation/identity.presentation.module';

@Module({
  imports: [IdentityInfrastructureModule, IdentityPresentationModule],
  exports: [IdentityInfrastructureModule, IdentityPresentationModule],
})
export class IdentityModule {}
