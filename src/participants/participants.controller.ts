import { Controller, Get, Post, Body, Put, Patch, Delete, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { AttendanceService } from 'src/attendance/attendance.service';

@Controller('participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService,
    private readonly attendanceService: AttendanceService,
  ) { }

  @Get()
  async findAll() {
    return await this.participantsService.findAll();
  }

  @Get('members')
  async getMembers() {
    return this.participantsService.findMembers();
  }

  @Get('visitors')
  async getVisitors() {
    return this.participantsService.findVisitors();
  }

  @Get('search')
  async search(@Query('name') name: string) {
    return this.participantsService.searchByName(name);
  }

  @Get(':id/status')
  async getStatus(@Param('id', ParseIntPipe) id: number) {
    return this.participantsService.getStatus(id);
  }

  @Get(':id/engagement')
  async getEngagement(
    @Param('id', ParseIntPipe) id: number,
    @Query('month') month: string,
    @Query('year') year: string
  ) {
    return this.participantsService.getEngagement(
      id,
      Number(month),
      Number(year)
    );
  }

  @Get(':id/report')
  async getIndividualReport(
    @Param('id', ParseIntPipe) id: number,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.participantsService.getIndividualReport(
      id,
      Number(month),
      Number(year),
    );
  }



  @Get('birthdays')
  async getBirthdays(@Query('month') month: string) {
    return this.participantsService.findBirthdays(Number(month));
  }

  @Get(':id/history')
  async getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.getHistoryByParticipantId(id);
  }



  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.participantsService.findOne(id);
  }


  @Post()
  async create(@Body() createParticipantDto: CreateParticipantDto) {
    return await this.participantsService.create(createParticipantDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateParticipantDto: UpdateParticipantDto) {
    return await this.participantsService.update(id, updateParticipantDto);
  }

  @Patch(':id')
  async partialUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateParticipantDto: UpdateParticipantDto) {
    return await this.participantsService.update(id, updateParticipantDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.participantsService.remove(id);
  }
}  
