import { IsString, MaxLength, MinLength } from 'class-validator';

// 可以添加一些校验规则
export class ResetCredentialsDto {
  @IsString()
  @MinLength(2)
  @MaxLength(20, { message: '密码长度不能超过20' })
  oldPassword: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20, { message: '密码长度不能超过20' })
  newPassword: string;
}
