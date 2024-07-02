import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { WorkoutLogService } from '../application/workoutLog.service';
import { SaveWorkoutLogRequestDto } from '../dto/SaveWorkoutLog.request.dto';
import { JwtAuthGuard } from '../../common/jwtPassport/jwtAuth.guard';

@Controller('workout-logs')
export class WorkoutLogController {
  constructor(private workoutLogService: WorkoutLogService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  saveWorkoutLogs(@Body() saveWorkoutLogRequestDtoArray: SaveWorkoutLogRequestDto[], @Request() req: any) {
    return this.workoutLogService.saveWorkoutLogs(req.user.id, saveWorkoutLogRequestDtoArray);
  }
}
