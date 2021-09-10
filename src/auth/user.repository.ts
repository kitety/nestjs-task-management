import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  private async hashPassword(
    password: string,
  ): Promise<{ hashedPassword: string; salt: string }> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return { hashedPassword, salt };
  }

  async validateUserPassword(authCredentialsDto: AuthCredentialsDto): Promise<{
    success: boolean;
    m: string;
    username: string;
  }> {
    const { username, password } = authCredentialsDto;
    const user = await this.findOne({ username });
    // 没有这个人
    if (!user) {
      return {
        success: false,
        m: 'User is not registered',
        username: '',
      };
    }

    if (user && (await user.validatePassword(password))) {
      return {
        success: true,
        m: '',
        username: user.username,
      };
    }
    // 密码错误
    return {
      success: false,
      m: 'Password is invalid',
      username: '',
    };
  }

  async resetUserPassword(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<boolean> {
    const { username, password } = authCredentialsDto;
    const user = await this.findOne({ username });

    const { hashedPassword, salt } = await this.hashPassword(password);

    user.username = username;
    user.salt = salt;
    user.password = hashedPassword;

    try {
      await user.save();
      return true;
    } catch (error) {
      return false;
    }
  }

  async signUp(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ success: boolean; m: string }> {
    const { username, password } = authCredentialsDto;

    const { hashedPassword, salt } = await this.hashPassword(password);

    const user = new User();
    user.username = username;
    user.salt = salt;
    user.password = hashedPassword;

    try {
      await user.save();
      return { success: true, m: '' };
    } catch (error) {
      const existCode = '23505';
      if (error.code === existCode) {
        return { success: false, m: 'Username already exists' };
      } else {
        return { success: false, m: 'server interface error' };
      }
    }
  }
}
