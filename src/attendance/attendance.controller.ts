import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Controller, Post, Body, Get, Param, Put, ParseIntPipe, Patch, Delete, UsePipes, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { RegisterAttendanceDto } from './dto/register-attendance.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }


    
    @Post()      // Criar presença individual (CRUD auxiliar)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    create(@Body() createAttendanceDto: CreateAttendanceDto) {
        return this.attendanceService.create(createAttendanceDto);
    }

    // Registrar várias presenças (principal rota)
    
    @Post('register')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @HttpCode(HttpStatus.CREATED) // <- status correto para criação
    async register(@Body() dto: RegisterAttendanceDto) {
        return this.attendanceService.registerAttendance(dto);
    }

    @Get()
    findAll() {
        return this.attendanceService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.attendanceService.findOne(id);
    }



    // Atualização completa
   
    @Put(':id')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateAttendanceDto: UpdateAttendanceDto,
    ) {
        return this.attendanceService.update(id, updateAttendanceDto);
    }

  
    @Patch(':id')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    partialUpdate(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateAttendanceDto: UpdateAttendanceDto,
    ) {
        return this.attendanceService.update(id, updateAttendanceDto);
    }

    
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT) // <- REST correto
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.attendanceService.remove(id);
    }

}
