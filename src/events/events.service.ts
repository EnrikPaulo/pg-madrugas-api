// events.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-events.dto';
import { UpdateEventDto } from './dto/update-events.dto';
import { EventCategory } from '@prisma/client';


@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) { }

  async create(createEventDto: CreateEventDto) {
    return this.prisma.event.create({ data: createEventDto });
  }

  async findAll(category?: EventCategory) {
    return this.prisma.event.findMany({
      where: category ? { category } : {},
    });
  }

  async getMonthlyEvents(category: EventCategory, month: number, year: number) {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    monthEnd.setHours(23, 59, 59, 999);

    return this.prisma.event.findMany({
      where: {
        category,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      orderBy: { date: 'asc' }, // opcional
    });
  }


  async getNextEvent(category: EventCategory) {
    const now = new Date();

    return await this.prisma.event.findFirst({
      where: {
        category,
        date: {
          gte: now
        }
      },
      orderBy: { date: 'asc' },
    });
  }

  async getUpcomingEvents() {
    const now = new Date();

    return this.prisma.event.findMany({
      where: {
        date: {
          gte: now   // eventos hoje ou posteriores
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
  }

  async getPastEvents() {
    const now = new Date();

    return this.prisma.event.findMany({
      where: {
        date: {
          lt: now  // eventos anteriores à data atual
        }
      },
      orderBy: {
        date: 'desc' // do mais recente para o mais antigo
      }
    });
  }


  async getDashboard() {
    const now = new Date();

    // 1. Próximo evento
    const nextEvent = await this.prisma.event.findFirst({
      where: { date: { gte: now } },
      orderBy: { date: 'asc' },
    });

    // ---------------------
    // 2. Eventos da semana
    // ---------------------
    const currentDay = now.getDay(); // 0 = domingo
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - currentDay);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const thisWeek = await this.prisma.event.findMany({
      where: {
        date: { gte: weekStart, lte: weekEnd }
      },
      orderBy: { date: 'asc' },
    });

    // ---------------------
    // 3. Eventos do mês
    // ---------------------
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const thisMonth = await this.prisma.event.findMany({
      where: {
        date: { gte: monthStart, lte: monthEnd }
      },
      orderBy: { date: 'asc' },
    });

    // ---------------------
    // 4. Próximos eventos (futuros)
    // ---------------------
    const upcoming = await this.prisma.event.findMany({
      where: {
        date: { gte: now }
      },
      orderBy: { date: 'asc' },
      take: 10 // traz só os 10 próximos (pode ajustar)
    });

    // ---------------------
    // 5. Eventos passados recentes
    // ---------------------
    const recentPast = await this.prisma.event.findMany({
      where: {
        date: { lt: now }
      },
      orderBy: { date: 'desc' },
      take: 5 // últimos 5 eventos
    });

    // ---------------------
    // DASHBOARD FINAL
    // ---------------------
    return {
      nextEvent,
      thisWeek,
      thisMonth,
      upcoming,
      recentPast,
    };
  }


  async getDashboardByCategory(category: EventCategory) {
    const now = new Date();

    // ---- Próximo evento por categoria ----
    const nextEvent = await this.prisma.event.findFirst({
      where: { category, date: { gte: now } },
      orderBy: { date: 'asc' },
    });

    // ---- Semana atual ----
    const day = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - day);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const thisWeek = await this.prisma.event.findMany({
      where: {
        category,
        date: { gte: weekStart, lte: weekEnd },
      },
      orderBy: { date: 'asc' },
    });

    // ---- Mês atual ----
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const thisMonth = await this.prisma.event.findMany({
      where: {
        category,
        date: { gte: monthStart, lte: monthEnd },
      },
      orderBy: { date: 'asc' },
    });

    // ---- Próximos eventos daquela categoria ----
    const upcoming = await this.prisma.event.findMany({
      where: {
        category,
        date: { gte: now },
      },
      orderBy: { date: 'asc' },
      take: 10,
    });

    // ---- Eventos passados recentes daquela categoria ----
    const recentPast = await this.prisma.event.findMany({
      where: {
        category,
        date: { lt: now },
      },
      orderBy: { date: 'desc' },
      take: 5,
    });

    return {
      category,
      nextEvent,
      thisWeek,
      thisMonth,
      upcoming,
      recentPast,
    };
  }


  async getWeeklyEvents(category: EventCategory, referenceDate: Date) {
    // 1. Calcular início e fim da semana (domingo → sábado)
    const date = new Date(referenceDate);
    const day = date.getDay(); // 0 = domingo

    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - day);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // 2. Buscar eventos da categoria na semana
    return this.prisma.event.findMany({
      where: {
        category,
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      orderBy: { date: 'asc' },
    });
  }



  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }
    return event;
  }

  async delete(id: number) {
    await this.findOne(id); // garante que existe
    return this.prisma.event.delete({ where: { id } });
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    await this.findOne(id); // garante que existe
    return this.prisma.event.update({ where: { id }, data: updateEventDto });
  }
}
