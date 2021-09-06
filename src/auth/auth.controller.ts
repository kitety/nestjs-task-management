import {
  Body,
  Controller,
  Get,
  Post,
  Response,
  ValidationPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';

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
    res.cookie('jwtToken', accessToken, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.status(200).json({ code: '0' });
  }

  @Post('/getUser')
  getUser(@Request() req, @Response() res, @GetUser() user: User) {
    console.log('user: ', user);
    res.status(200).json({ code: '0' });
  }
}
