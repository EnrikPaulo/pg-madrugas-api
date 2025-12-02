import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 🔹 Registrar novo administrador
  async register(email: string, password: string) {
    // 1) Verifica se email já existe
    const userExists = await this.prisma.user.findUnique({ where: { email } });
    if (userExists) {
      throw new BadRequestException('E-mail já está em uso');
    }

    // 2) Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3) Criar usuário no banco
    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword, role: 'admin' },
    });

    return { message: 'Administrador criado com sucesso', userId: user.id };
  }

  // 🔹 Login
  async login(email: string, password: string) {
    // 1) Buscar usuário pelo email
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // 2) Validar senha
    const senhaValida = await bcrypt.compare(password, user.password);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // 3) Montar payload do token
    const payload = { sub: user.id, email: user.email, role: user.role };

    // 4) Gerar token JWT
    const token = await this.jwtService.signAsync(payload);

    return { access_token: token };
  }
}

