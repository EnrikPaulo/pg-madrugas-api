import { Controller, Get, Post, Body, Put, Patch, Delete, Param, ParseIntPipe, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-events.dto';
import { UpdateEventDto } from './dto/update-events.dto';
import { EventCategory } from '@prisma/client';


@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    async create(@Body() createEventDto: CreateEventDto) {
        return await this.eventsService.create(createEventDto);
    }

    @Get()
    async findAll(@Query('category') category?: EventCategory) {
        return await this.eventsService.findAll(category);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.eventsService.findOne(id);
    }

    @Get('monthly')
    async getMonthlyEvents(
        @Query('category') category: EventCategory,
        @Query('month') month: string,
        @Query('year') year: string,
    ) {
        return await this.eventsService.getMonthlyEvents(
            category,
            Number(month),
            Number(year),
        );
    }

    @Get('weekly')
    async getWeeklyEvents(
        @Query('category') category: EventCategory,
        @Query('date') date: string,
    ) {
        return await this.eventsService.getWeeklyEvents(
            category,
            new Date(date),
        );
    }

    @Get('next')
    async getNextEvent(
        @Query('category') category: EventCategory
    ) {
        return await this.eventsService.getNextEvent(category);
    }

    @Get('upcoming')
    async getUpcomingEvents() {
        return await this.eventsService.getUpcomingEvents();
    }

    @Get('past')
    async getPastEvents() {
        return await this.eventsService.getPastEvents();
    }

    @Get('dashboard')
    async getDashboard() {
        return await this.eventsService.getDashboard();
    }

    @Get('dashboard-by-category')
    async getDashboardByCategory(
        @Query('category') category: EventCategory
    ) {
        return await this.eventsService.getDashboardByCategory(category);
    }



    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateEventDto: UpdateEventDto) {
        return await this.eventsService.update(id, updateEventDto);
    }

    @Patch(':id')
    async partialUpdate(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateEventDto: UpdateEventDto) {
        return await this.eventsService.update(id, updateEventDto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.eventsService.delete(id);
    }


}
