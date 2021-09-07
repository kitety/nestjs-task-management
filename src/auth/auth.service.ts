import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { ResetCredentialsDto } from './dto/reset-credentials.dto';
import { JwtPayload } from './jwt-payload.interface';
import { UserRepository } from './user.repository';

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
    const username = await this.userRepository.validateUserPassword(
      authCredentialsDto,
    );

    if (!username) {
      return { success: false, m: ' password not valid' };
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
    const resUserName = await this.userRepository.validateUserPassword(newAuth);
    if (!resUserName) {
      return { success: false, m: 'Old password is incorrect' };
    }

    newAuth = { username, password: authCredentialsDto.newPassword };

    const isSuccess = await this.userRepository.resetUserPassword(newAuth);
    if (isSuccess) {
      return { success: true, m: 'Password changed successfully' };
    } else {
      return { success: false, m: 'resetError' };
    }
  }
}
