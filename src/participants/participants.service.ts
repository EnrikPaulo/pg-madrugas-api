import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';

@Injectable()
export class ParticipantsService {
    constructor(private prisma: PrismaService) { }

    findAll() {
        return this.prisma.participant.findMany();
    }

    async findOne(id: number) {
        const participants = await this.prisma.participant.findUnique({ where: { id } });
        if (!participants) {
            throw new NotAcceptableException('Participante não encontrado');
        }
        return participants;
    }

    async findMembers() {
        return this.prisma.participant.findMany({
            where: { isVisitor: false },
            orderBy: { name: 'asc' },
        });
    }

    async searchByName(name: string) {
        return this.prisma.participant.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive',
                },
            },
            orderBy: { name: 'asc' },
        });
    }


    async findVisitors() {
        return this.prisma.participant.findMany({
            where: { isVisitor: true },
            orderBy: { name: 'asc' },
        })
    }

    async findBirthdays(month: number) {
        return this.prisma.participant.findMany({
            where: {
                birthDate: {
                    // pega pessoas cujo mês de nascimento = month
                    gte: new Date(1900, month - 1, 1),
                    lt: new Date(1900, month, 1),
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    async getStatus(id: number) {
  // 1. Buscar o participante
  const participant = await this.prisma.participant.findUnique({
    where: { id },
  });

  if (!participant) {
    throw new NotFoundException('Participante não encontrado');
  }

  // 2. Buscar presenças e faltas
  const totalPresences = await this.prisma.attendance.count({
    where: { participantId: id, present: true },
  });

  const totalAbsences = await this.prisma.attendance.count({
    where: { participantId: id, present: false },
  });

  // 3. Última presença em evento
  const lastPresence = await this.prisma.attendance.findFirst({
    where: { participantId: id, present: true },
    orderBy: { event: { date: 'desc' } },
    include: { event: true },
  });

  return {
    id: participant.id,
    name: participant.name,
    isVisitor: participant.isVisitor,
    totalPresences,
    totalAbsences,
    lastPresence: lastPresence?.event.date || null,
    becameMemberAfter: 2, // RN02 (2 presenças para virar membro)
  };
}

async getEngagement(id: number, month: number, year: number) {
  // 1. Criar intervalo do mês
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  monthEnd.setHours(23, 59, 59, 999);

  // 2. Buscar TODAS as presenças e faltas do participante no mês
  const records = await this.prisma.attendance.findMany({
    where: {
      participantId: id,
      event: {
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    },
    include: {
      event: true,
    },
    orderBy: {
      event: { date: 'asc' },
    },
  });

  // Se não teve nenhum evento no mês
  if (records.length === 0) {
    return {
      participantId: id,
      month,
      year,
      totalEvents: 0,
      presences: 0,
      absences: 0,
      participationRate: 0,
      presenceDates: [],
      absenceDates: [],
      categories: [],
    };
  }

  // 3. Contar presenças e faltas
  const presences = records.filter(r => r.present).length;
  const absences = records.filter(r => !r.present).length;

  // 4. Pegar datas de presenças e faltas
  const presenceDates = records
    .filter(r => r.present)
    .map(r => r.event.date);

  const absenceDates = records
    .filter(r => !r.present)
    .map(r => r.event.date);

  // 5. Categorias que ele participou no mês
  const categories = Array.from(
    new Set(records.map(r => r.event.category))
  );

  // 6. Percentual de engajamento
  const participationRate =
    (presences / (presences + absences)) * 100;

  return {
    participantId: id,
    month,
    year,
    totalEvents: records.length,
    presences,
    absences,
    participationRate: Number(participationRate.toFixed(2)),
    presenceDates,
    absenceDates,
    categories,
  };
}




    create(createParticipantDto: CreateParticipantDto) {
        return this.prisma.participant.create({ data: createParticipantDto });
    }

    async update(id: number, updateParticipantDto: UpdateParticipantDto) {
        const existing = await this.findOne(id);
        return this.prisma.participant.update({
            where: { id: existing.id },
            data: updateParticipantDto
        })
    }

    async getIndividualReport(id: number, month: number, year: number) {
  // 1. Buscar dados básicos do participante
  const participant = await this.prisma.participant.findUnique({
    where: { id },
  });

  if (!participant) {
    throw new NotFoundException('Participante não encontrado');
  }

  // 2. Buscar status
  const status = await this.getStatus(id);

  // 3. Buscar histórico completo
  const history = await this.prisma.attendance.findMany({
    where: { participantId: id },
    include: {
      event: true,
    },
    orderBy: { event: { date: 'desc' } },
  });

  // 4. Buscar engajamento do mês selecionado
  const engagement = await this.getEngagement(id, month, year);

  // 5. Consolidar relatório
  return {
    participant: {
      id: participant.id,
      name: participant.name,
      isVisitor: participant.isVisitor,
    },
    status,
    engagement,
    history: history.map(h => ({
      event: h.event.name,
      category: h.event.category,
      date: h.event.date,
      present: h.present,
    })),
  };
}


    async remove(id: number) {
        const existing = await this.findOne(id);
        return this.prisma.participant.delete({ where: { id: existing.id } });
    }

}
