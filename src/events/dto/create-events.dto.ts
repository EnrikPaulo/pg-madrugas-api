import { IsString, IsInt, IsOptional, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { EventCategory } from '@prisma/client';


export class CreateEventDto {
    @IsString()
    name: string;

    @IsEnum(EventCategory)
    category: EventCategory;


    @Type(() => Date)
    @IsDate()
    date: Date;

    @IsOptional()
    @IsInt()
    visitors?: number;

    @IsInt()
    totalPresent: number;
}