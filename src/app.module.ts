import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ParticipantsModule } from './participants/participants.module';
import { AttendanceModule } from './attendance/attendance.module';
import { EventsModule } from './events/events.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReportsModule } from './reports/reports.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ParticipantsModule, AttendanceModule, EventsModule, PrismaModule, ReportsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
