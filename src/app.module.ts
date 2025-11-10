import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ParticipantsModule } from './participants/participants.module';
import { AttendanceModule } from './attendance/attendance.module';
import { EventsModule } from './events/events.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ParticipantsModule, AttendanceModule, EventsModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
