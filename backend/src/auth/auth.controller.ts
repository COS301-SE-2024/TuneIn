import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() authInfo: any) {
    const user = await this.authService.listUsers(authInfo.userSub);
    if (!user) {
      return { message: 'Invalid credentials' };
    }
    // Handle login logic, like generating JWT
    return { message: 'Login successful' };
  }
}
