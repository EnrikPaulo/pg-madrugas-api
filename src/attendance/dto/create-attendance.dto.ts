import { IsInt, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class CreateAttendanceDto {
    @Type(() => Number)
    @IsInt()
    eventId: number;

    @Type(() => Number)
    @IsInt()
    participantId: number;

    @Type(() => Boolean)
    @IsBoolean()
    present: boolean;   
}