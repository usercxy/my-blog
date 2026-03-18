import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';

import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

interface TokenPayload {
  sub: string;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userService.findByUsername(dto.username);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const passwordValid = await compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    return this.issueTokens(user.id, user.username);
  }

  async refresh(dto: RefreshTokenDto) {
    let payload: TokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(dto.refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token 无效或已过期');
    }

    const user = await this.userService.findByIdOrThrow(BigInt(payload.sub));

    if (!user.refreshToken) {
      throw new UnauthorizedException('Refresh token 已失效');
    }

    const refreshTokenMatched = await compare(dto.refreshToken, user.refreshToken);

    if (!refreshTokenMatched) {
      throw new UnauthorizedException('Refresh token 校验失败');
    }

    return this.issueTokens(user.id, user.username);
  }

  async getProfile(userId: string) {
    const user = await this.userService.findByIdOrThrow(BigInt(userId));
    return this.userService.toProfile(user);
  }

  private async issueTokens(userId: bigint, username: string) {
    const payload: TokenPayload = {
      sub: userId.toString(),
      username,
    };
    const accessExpiresIn =
      this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN') as never;
    const refreshExpiresIn =
      this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN') as never;

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: accessExpiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpiresIn,
    });

    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: await hash(refreshToken, 10),
      },
    });

    const user = await this.userService.findByIdOrThrow(userId);

    return {
      accessToken,
      refreshToken,
      user: this.userService.toProfile(user),
    };
  }
}
