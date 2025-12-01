import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { ReportsModule } from 'src/reports/reports.module';

@Module({
  imports: [ReportsModule],
  providers: [AttendanceService],
  exports: [AttendanceService],
  controllers: [AttendanceController]
})
export class AttendanceModule {}
