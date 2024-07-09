import { Body, Controller, Post, UseGuards, Request, Query, Get, Patch } from '@nestjs/common';
import { WorkoutLogService } from '../application/workoutLog.service';
import { SaveWorkoutLogRequestDto } from '../dto/SaveWorkoutLog.request.dto';
import { JwtAuthGuard } from '../../common/jwtPassport/jwtAuth.guard';
import { ExerciseDataRequestDto } from '../dto/exerciseData.request.dto';
import { UpdateWorkoutLogRequestDto } from '../dto/updateWorkoutLog.request.dto';

@Controller('workout-logs')
export class WorkoutLogController {
  constructor(private workoutLogService: WorkoutLogService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  saveWorkoutLogs(
    @Body('workoutLogs') saveWorkoutLogRequestDtoArray: SaveWorkoutLogRequestDto[],
    @Body('exercise') exercises: ExerciseDataRequestDto[],
    @Request() req: any,
  ) {
    return this.workoutLogService.saveWorkoutLogs(req.user.id, exercises, saveWorkoutLogRequestDtoArray);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getWorkoutLogs(@Query('date') date: string, @Request() req: any) {
    return this.workoutLogService.getWorkoutLogsByDay(date, req.user.id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  bulkUpdateWorkoutLogs(
    @Request() req: any,
    @Body('exercises') exercises: ExerciseDataRequestDto[],
    @Body('workoutLogs') updateWorkoutLogRequestDtoArray: UpdateWorkoutLogRequestDto[],
  ) {
    return this.workoutLogService.bulkUpdateWorkoutLogs(req.user.id, exercises, updateWorkoutLogRequestDtoArray);
  }
}
