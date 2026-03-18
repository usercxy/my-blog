import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.register({}), UserModule],
  controllers: [AuthController],
  providers: [AuthService, AdminAuthGuard],
  exports: [AuthService, AdminAuthGuard, JwtModule],
})
export class AuthModule {}
