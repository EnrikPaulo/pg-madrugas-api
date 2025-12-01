import { IsInt, IsArray, ValidateNested, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class AttendeeDto {
  @IsOptional()
  @IsInt()
  participantId?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isVisitor?: boolean;

  @IsBoolean()
  present!: boolean;
}

export class RegisterAttendanceDto {
  @IsInt()
  eventId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendeeDto)
  attendees!: AttendeeDto[];
}
