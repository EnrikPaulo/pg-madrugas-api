import { IsString, IsInt, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateParticipantDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsInt()
    age: number;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    birthDate?: Date;

    @IsOptional()
    @IsString()
    role: string;
}