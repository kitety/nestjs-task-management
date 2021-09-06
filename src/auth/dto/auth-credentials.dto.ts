import { IsString, MaxLength, MinLength } from 'class-validator';

// 可以添加一些校验规则
export class AuthCredentialsDto {
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20, { message: '密码长度不能超过20' })
  password: string;
}
