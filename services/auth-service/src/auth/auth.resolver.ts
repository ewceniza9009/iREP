import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { TokenResponse } from './interfaces/token-response.interface';
import { GetUser } from './decorators/get-user.decorator';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => TokenResponse)
  async login(@Args('loginDto') loginDto: LoginDto): Promise<TokenResponse> {
    return this.authService.login(loginDto);
  }

  @Mutation(() => String)
  @UseGuards(AuthGuard('jwt'))
  async logout(@GetUser() user: JwtPayload): Promise<string> {
    const result = await this.authService.logout(user.id);
    return result.message;
  }
}