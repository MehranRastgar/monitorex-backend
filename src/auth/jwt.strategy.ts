import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'MEHRAN',
    });
  }

  async validate(payload: any) {
    //const user= await this.userService.getById(payload.sub)
    console.log('validate', payload);

    return {
      id: payload.sub,
      name: payload.username,
    };
  }
}
