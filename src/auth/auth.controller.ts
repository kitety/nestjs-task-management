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

  /**
   * 注册
   * @param authCredentialsDto 请求数据
   * @param res 响应
   */
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

  /**
   * 登陆
   * @param authCredentialsDto 请求数据
   * @param res
   */
  @Post('/signin')
  async signIn(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
    @Response() res,
  ) {
    const signData = await this.authService.signIn(authCredentialsDto);
    if (!signData.success) {
      res.status(200).json({ c: STATUS_ENUM.ERROR, m: signData.m });
    } else {
      res.cookie(JWT_KEYWORD, signData.data, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      res.status(200).json({ c: STATUS_ENUM.SUCCESS });
    }
  }

  /**
   * 退出
   * @param res
   */
  @Post('/logout')
  async logOut(@Response() res) {
    res.clearCookie(JWT_KEYWORD);
    res.status(200).json({ c: STATUS_ENUM.SUCCESS });
  }

  /**
   * 通过post的数据验证是否登陆
   */
  @Post('/getUserByJwt')
  async getUserByJwt(@Body() data: { jwt: string }, @Response() res) {
    const username = await this.authService.validateUserToken(data);
    res.status(200).json({
      c: STATUS_ENUM.SUCCESS,
      d: { username: username || null },
    });
  }

  /**
   * 通过cookie获取用户名
   * @param res 响应
   * @param username cookie的jwt的解码的名称
   */
  @Get('/getUser')
  getUserByCookie(@Response() res, @GetUser() username: string) {
    res.status(200).json({
      c: STATUS_ENUM.SUCCESS,
      d: { username: username || null },
    });
  }

  /**
   * 充值密码
   * @param authCredentialsDto 请求数据
   * @param res 响应
   * @param username cookie的jwt的解码的名称
   */
  @Post('/reset')
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
