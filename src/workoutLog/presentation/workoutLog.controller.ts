import { Body, Controller, Post, UseGuards, Request, Query, Get, Patch, Delete, HttpCode } from '@nestjs/common';
import { WorkoutLogService } from '../application/workoutLog.service';
import { JwtAuthGuard } from '../../common/jwtPassport/jwtAuth.guard';
import { SoftDeleteWorkoutLogRequestDto } from '../dto/softDeleteWorkoutLog.request.dto';
import { SaveWorkoutLogsRequestDto } from '../dto/saveWorkoutLogs.request.dto';
import { UpdateWorkoutLogsRequestDto } from '../dto/updateWorkoutLogs.request.dto';

@Controller('workout-logs')
export class WorkoutLogController {
  constructor(private workoutLogService: WorkoutLogService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  saveWorkoutLogs(@Body() saveWorkoutLogs: SaveWorkoutLogsRequestDto, @Request() req: any) {
    return this.workoutLogService.bulkInsertWorkoutLogs(req.user.id, saveWorkoutLogs);
  }

  @Get()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  getWorkoutLogs(@Query('date') date: string, @Request() req: any) {
    return this.workoutLogService.getWorkoutLogsByDay(date, req.user.id);
  }

  @Patch()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  bulkUpdateWorkoutLogs(@Request() req: any, @Body() updateWorkoutLogs: UpdateWorkoutLogsRequestDto) {
    return this.workoutLogService.bulkUpdateWorkoutLogs(req.user.id, updateWorkoutLogs);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  softDeleteWorkoutLogs(@Body() softDeleteWorkoutLogRequestDto: SoftDeleteWorkoutLogRequestDto, @Request() req: any) {
    return this.workoutLogService.softDeleteWorkoutLogs(softDeleteWorkoutLogRequestDto, req.user);
  }

  @Get('user')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  getAggregatedWorkoutLogsByUser(@Request() req: any) {
    return this.workoutLogService.getAggregatedWorkoutLogsByUser(req.user);
  }

  @Get('year')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  getWorkoutLogsByYear(@Query('year') year: string, @Request() req: any) {
    return this.workoutLogService.getWorkoutLogsByYear(req.user, year);
  }

  @Get('year-month')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  getWorkoutLogsByMonth(@Query('year') year: string, @Query('month') month: string, @Request() req: any) {
    return this.workoutLogService.getWorkoutLogsByYearMonth(req.user, year, month);
  }

  @Get('best')
  @HttpCode(200)
  getBestWorkoutLogs() {
    return this.workoutLogService.getBestWorkoutLogs();
  }
}
