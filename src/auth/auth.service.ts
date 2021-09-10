import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { ResetCredentialsDto } from './dto/reset-credentials.dto';
import { JwtPayload } from './jwt-payload.interface';
import { UserRepository } from './user.repository';
import * as config from 'config';
import * as jwt from 'jsonwebtoken';

const jwtConfig = config.get('jwt');

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ success: boolean; m: string }> {
    return await this.userRepository.signUp(authCredentialsDto);
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ success: boolean; m: string; data?: string }> {
    const { success, m, username } =
      await this.userRepository.validateUserPassword(authCredentialsDto);

    if (!success) {
      return { success: false, m };
    }

    const payload: JwtPayload = { username };
    const accessToken = await this.jwtService.sign(payload);
    this.logger.debug(
      `Generated JWT Token with payload ${JSON.stringify(payload)}`,
    );
    return { success: true, m: '', data: accessToken };
  }

  async resetPassword(
    authCredentialsDto: ResetCredentialsDto,
    username,
  ): Promise<{ success: boolean; m: string }> {
    let newAuth = { username, password: authCredentialsDto.oldPassword };
    const { success, m } = await this.userRepository.validateUserPassword(
      newAuth,
    );
    // 验证失败
    if (!success) {
      return { success: false, m };
    }
    // 构造新的数据
    newAuth = { username, password: authCredentialsDto.newPassword };

    const isSuccess = await this.userRepository.resetUserPassword(newAuth);
    if (isSuccess) {
      return { success: true, m: 'Password changed successfully' };
    } else {
      return { success: false, m: 'resetError' };
    }
  }

  async validateUserToken(data: { jwt: string }): Promise<string> {
    const jwtStr = data?.jwt || '';
    const userData = (await jwt.decode(
      jwtStr,
      jwtConfig.secret,
    )) as unknown as {
      username: string;
    };

    return userData?.username;
  }
}
