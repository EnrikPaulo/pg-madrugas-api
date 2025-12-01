import { 
  Controller, 
  Post, 
  Body, 
  BadRequestException 
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 🔹 Registrar administrador
  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    if (!email || !password) {
      throw new BadRequestException('E-mail e senha são obrigatórios');
    }

    return this.authService.register(email, password);
  }

  // 🔹 Login
  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    if (!email || !password) {
      throw new BadRequestException('E-mail e senha são obrigatórios');
    }

    return this.authService.login(email, password);
  }
}

