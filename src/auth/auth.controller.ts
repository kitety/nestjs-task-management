import {
  Body,
  Controller,
  Get,
  Post,
  Response,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { GetUser } from './get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signUp(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
    @Response() res,
  ) {
    await this.authService.signUp(authCredentialsDto);
    res.status(200).json({ code: '0' });
  }

  @Post('/signin')
  async signIn(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
    @Response() res,
  ) {
    const accessToken = await this.authService.signIn(authCredentialsDto);
    if (!accessToken) {
      res.status(200).json({ code: '1', message: '登陆失败' });
      return;
    }
    res.cookie('jwt', accessToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(200).json({ code: '0' });
  }

  @Post('/logout')
  async logOut(@Response() res) {
    res.clearCookie('jwt');
    res.status(200).json({ code: '0' });
  }

  @Get('/getUser')
  getUser(@Response() res, @GetUser() username: string) {
    res.status(200).json({ code: '0', username: username || null });
  }
  @Post('/reset')
  resetPassword(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
    @Response() res,
    @GetUser() username: string,
  ) {
    if (!username) {
      res.status(200).json({ code: '1', m: 'Please login first' });
    }
  }
}
