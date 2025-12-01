import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { EventCategory } from '@prisma/client';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly')
async getMonthlyReport(
  @Query('category') category: EventCategory,
  @Query('month') month: string,
  @Query('year') year: string,
) {
  return this.reportsService.getMonthlyReport(
    category,
    Number(month),
    Number(year)
  );
}

@Get('weekly')
async getWeeklyReport(
  @Query('category') category: EventCategory,
  @Query('date') date: string,
) {
  return this.reportsService.getWeeklyReport(
    category, 
    new Date(date));
}
}
