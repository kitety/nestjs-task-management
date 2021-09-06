import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as config from 'config';
import * as jwt from 'jsonwebtoken';

const jwtConfig = config.get('jwt');

export const GetUser = createParamDecorator(
  async (_data, ctx: ExecutionContext): Promise<string> => {
    const req = ctx.switchToHttp().getRequest();
    const userData = (await jwt.decode(
      req.cookies.jwt,
      jwtConfig.secret,
    )) as unknown as { username: string };

    return userData?.username;
  },
);
