import {
  Body,
  Controller,
  Get,
  Post,
  Response,
  ValidationPipe,
} from '@nestjs/common';
import { JWT_KEYWORD, STATUS_ENUM } from 'src/constants';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { ResetCredentialsDto } from './dto/reset-credentials.dto';
import { GetUser } from './get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signUp(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
    @Response() res,
  ) {
    const data = await this.authService.signUp(authCredentialsDto);
    res.status(200).json({
      c: data.success ? STATUS_ENUM.SUCCESS : STATUS_ENUM.ERROR,
      m: data.m,
    });
  }

  @Post('/signin')
  async signIn(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
    @Response() res,
  ) {
    const signData = await this.authService.signIn(authCredentialsDto);
    if (!signData.success) {
      return res.status(200).json({ c: STATUS_ENUM.ERROR, m: signData.m });
    }
    res.cookie(JWT_KEYWORD, signData.data, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(200).json({ c: STATUS_ENUM.SUCCESS });
  }

  @Post('/logout')
  async logOut(@Response() res) {
    res.clearCookie(JWT_KEYWORD);
    res.status(200).json({ c: STATUS_ENUM.SUCCESS });
  }

  @Get('/getUser')
  getUser(@Response() res, @GetUser() username: string) {
    res.status(200).json({
      c: STATUS_ENUM.SUCCESS,
      d: { username: username || null },
    });
  }
  @Get('/reset')
  async resetPassword(
    @Body(ValidationPipe) authCredentialsDto: ResetCredentialsDto,
    @Response() res,
    @GetUser() username: string,
  ) {
    // 没有用户名
    if (!username) {
      res.status(200).json({ c: '1', m: 'Please login first' });
    } else {
      const data = await this.authService.resetPassword(
        authCredentialsDto,
        username,
      );
      if (data.success) {
        res.clearCookie(JWT_KEYWORD);
      }
      res.status(200).json({
        c: data.success ? STATUS_ENUM.SUCCESS : STATUS_ENUM.ERROR,
        m: data.m,
      });
    }
  }
}
