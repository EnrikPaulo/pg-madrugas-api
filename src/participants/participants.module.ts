import { Module } from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { ParticipantsController } from './participants.controller';
import { AttendanceModule } from '../attendance/attendance.module';


@Module({
  imports: [AttendanceModule],
  providers: [ParticipantsService],
  controllers: [ParticipantsController],
})
export class ParticipantsModule {}
