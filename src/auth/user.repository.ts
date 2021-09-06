import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/reset-credentials.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  private async hashPassword(
    password: string,
  ): Promise<{ hashedPassword: string; salt: string }> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return { hashedPassword, salt };
  }

  async validateUserPassword(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<string> {
    const { username, password } = authCredentialsDto;
    const user = await this.findOne({ username });

    if (user && (await user.validatePassword(password))) {
      return user.username;
    }
    return null;
  }

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;
    console.log(' username, password : ', username, password);

    const { hashedPassword, salt } = await this.hashPassword(password);

    const user = new User();
    user.username = username;
    user.salt = salt;
    user.password = hashedPassword;

    try {
      await user.save();
    } catch (error) {
      const existCode = '23505';
      if (error.code === existCode) {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
