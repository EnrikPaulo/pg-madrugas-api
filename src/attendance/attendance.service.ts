import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterAttendanceDto, AttendeeDto } from './dto/register-attendance.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { ReportsService } from 'src/reports/reports.service';


@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService,
              private reportsService: ReportsService,
  ) { }


  findAll() {
    return this.prisma.attendance.findMany({
      include: { event: true, participant: true },
    })
  }

  async findOne(id: number) {
    const attendance = await this.prisma.attendance.findUnique({ where: { id } });
    if (!attendance) {
      throw new NotFoundException('Presença não encontrada');
    }
    return attendance;
  }

  create(createAttendanceDto: CreateAttendanceDto) {
    return this.prisma.attendance.create({ data: createAttendanceDto });
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    await this.findOne(id);
    return this.prisma.attendance.update({ where: { id }, data: updateAttendanceDto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.attendance.delete({ where: { id } });
  }

  async getHistoryByParticipantId(participantId: number) {
    return this.prisma.attendance.findMany({
      where: { participantId },
      include: {
        event: true,
        participant: true
      },
      orderBy: {
        event: {
          date: 'desc'
        }
      }
    });
  }


  async registerAttendance(dto: RegisterAttendanceDto) {
    const { eventId, attendees } = dto;

    // 1) Confere se evento existe
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Evento não encontrado');

    // 2) Para cada attendee: resolve participantId (se já tiver) ou cria participante novo
    // Vamos construir um array com os objetos prontos para inserir na tabela attendance.
    const attendanceData: { eventId: number; participantId: number; present: boolean }[] = [];

    for (const a of attendees as AttendeeDto[]) {
      let participantId: number;

      if (a.participantId) {
        // usa participante existente (pode checar existência se quiser)
        participantId = a.participantId;
      } else if (a.name) {
        // cria participante novo e pega o id
        const created = await this.prisma.participant.create({
          data: { name: a.name },
        });
        participantId = created.id;
      } else {
        // nenhum id nem nome -> ignora ou lança erro; aqui lanço erro
        throw new Error('Attendee precisa ter participantId ou name');
      }

      attendanceData.push({
        eventId,
        participantId,
        present: Boolean(a.present),
      });

      // Opcional: se for visitante, você pode criar um registro em outra tabela ou marcar algo
      // Aqui vamos apenas contar visitantes depois.
    }



    // 3) Limpar presenças antigas do mesmo evento? (opcional)
    // Se quiser sobrescrever: delete attendances antigas do evento
    // await this.prisma.attendance.deleteMany({ where: { eventId } });

    // 4) Inserir em lote
    // createMany é eficiente, mas não retorna os registros. Está ok aqui.
    await this.prisma.attendance.createMany({
      data: attendanceData,
      skipDuplicates: true, // se quiser evitar duplicatas com constraint
    });

    // ==== RN01 — MARCAR FALTAS AUTOMATICAMENTE ====

    const allMembers = await this.prisma.participant.findMany({
      where: { isVisitor: false },
      select: { id: true },
    });

    // lista com ids dos membros
    const memberIds = allMembers.map(m => m.id);

    // lista com ids dos que vieram
    const presentIds = attendanceData.map(a => a.participantId);

    // ids dos membros ausentes
    const absentIds = memberIds.filter(id => !presentIds.includes(id));

    // montar objetos de falta
    const absencesData = absentIds.map(id => ({
      eventId,
      participantId: id,
      present: false,
      isVisitor: false,
    }));

    // inserir todas as faltas
    await this.prisma.attendance.createMany({
      data: absencesData,
      skipDuplicates: true,
    });

    // ==== RN02 — CONVERSÃO AUTOMÁTICA DE VISITANTE ====

    // pegar todos que estiveram presentes neste evento
    const presentParticipants = attendanceData
      .filter(a => a.present === true)
      .map(a => a.participantId);

    // para cada participante presente:
    for (const participantId of presentParticipants) {
      // contar quantas presenças TRUE ele possui no histórico
      const totalPresences = await this.prisma.attendance.count({
        where: {
          participantId,
          present: true,
        },
      });

      // se atingiu 2 ou mais -> vira membro
      if (totalPresences >= 2) {
        await this.prisma.participant.update({
          where: { id: participantId },
          data: { isVisitor: false },
        });
      }
    }

    
    



    // 5) Atualizar contadores do evento: visitors e totalPresent
    const totalPresent = attendanceData.filter(a => a.present).length;
    // visitors: contamos os elementos marcados isVisitor true
    // -> precisamos contar de `attendees` originais
    const visitorsCount = attendees.filter(a => a.isVisitor).length;

    await this.prisma.event.update({
      where: { id: eventId },
      data: {
        visitors: (event.visitors ?? 0) + visitorsCount,
        totalPresent: (event.totalPresent ?? 0) + totalPresent,
      },
    });
    
    // =================== RN03 — ATUALIZAR RELATÓRIOS AUTOMATICAMENTE ===================

// Atualizar relatório semanal
await this.reportsService.getWeeklyReport(
  event.category,
  event.date
);

// Atualizar relatório mensal
await this.reportsService.getMonthlyReport(
  event.category,
  event.date.getMonth() + 1, // mês
  event.date.getFullYear()   // ano
);

// ==================================================================


    // 6) Retornar um resumo
    return { created: attendanceData.length, totalPresent, visitorsCount };
  }
}
