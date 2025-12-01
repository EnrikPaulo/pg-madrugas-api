import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventCategory } from '@prisma/client';


@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }


    async getMonthlyReport(category: EventCategory, month: number, year: number) {
        // 1. Criar intervalo do mês
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);
        monthEnd.setHours(23, 59, 59, 999);

        // 2. Buscar todos os eventos da categoria no mês
        const events = await this.prisma.event.findMany({
            where: {
                category,
                date: { gte: monthStart, lte: monthEnd }
            }
        });

        // Se não houver eventos, retornar relatório vazio
        if (events.length === 0) {
            return {
                month,
                year,
                category,
                totalEvents: 0,
                totalUniqueParticipants: 0,
                totalUniqueVisitors: 0,
                participants: [],
                visitors: []
            };
        }

        const eventIds = events.map(e => e.id);

        // 3. Buscar participantes únicos presentes
        const uniqueParticipants = await this.prisma.attendance.findMany({
            where: {
                eventId: { in: eventIds },
                present: true
            },
            distinct: ['participantId'],
            include: {
                participant: true
            }
        });

        // 4. Buscar visitantes únicos
        const uniqueVisitors = await this.prisma.attendance.findMany({
            where: {
                eventId: { in: eventIds },
                present: true,
                participant: { isVisitor: true }
            },
            distinct: ['participantId'],
            include: {
                participant: true
            }
        });

        // 5. Retornar relatório no formato final inteligente
        return {
            month,
            year,
            category,
            totalEvents: events.length,
            totalUniqueParticipants: uniqueParticipants.length,
            totalUniqueVisitors: uniqueVisitors.length,
            participants: uniqueParticipants.map(a => a.participant.name),
            visitors: uniqueVisitors.map(a => a.participant.name)
        };
    }

    async getWeeklyReport(category: EventCategory, anyDateInsideWeek: Date) {
        const date = new Date(anyDateInsideWeek);
        const day = date.getDay(); // 0 = domingo

        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - day);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);


        const events = await this.prisma.event.findMany({
            where: {
                category,
                date: { gte: weekStart, lte: weekEnd }
            }
        });

        if (events.length === 0) {
            return {
                weekStart,
                weekEnd,
                category,
                totalEvents: 0,
                totalUniqueParticipants: 0,
                totalUniqueVisitors: 0,
                participants: [],
                visitors: []
            };
        }

        const eventIds = events.map(e => e.id);

        const uniqueParticipants = await this.prisma.attendance.findMany({
            where: {
                eventId: { in: eventIds },
                present: true
            },
            distinct: ['participantId'],
            include: {
                participant: true
            }
        });

        const uniqueVisitors = await this.prisma.attendance.findMany({
            where: {
                eventId: { in: eventIds },
                present: true,
                participant: { isVisitor: true }
            },
            distinct: ['participantId'],
            include: {
                participant: true
            }
        });

        return {
            weekStart,
            weekEnd,
            category,
            totalEvents: events.length,
            totalUniqueParticipants: uniqueParticipants.length,
            totalUniqueVisitors: uniqueVisitors.length,
            participants: uniqueParticipants.map(a => a.participant.name),
            visitors: uniqueVisitors.map(a => a.participant.name)
        };
    }

}