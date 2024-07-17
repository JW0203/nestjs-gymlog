import { Body, Controller, Delete, Get, HttpCode, Logger, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { RoutineService } from '../application/routine.service';
import { JwtAuthGuard } from '../../common/jwtPassport/jwtAuth.guard';
import { GetRoutineRequestDto } from '../dto/getRoutine.request.dto';
import { UpdateRoutinesRequestDto } from '../dto/updateRoutines.request.dto';
import { DeleteRoutineRequestDto } from '../dto/deleteRoutine.request.dto';
import { SaveRoutinesRequestDto } from '../dto/saveRoutines.request.dto';

@Controller('routines')
export class RoutineController {
  private readonly logger = new Logger(RoutineController.name);
  constructor(private readonly routineService: RoutineService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  postRoutine(@Body() saveRoutines: SaveRoutinesRequestDto, @Request() req: any) {
    return this.routineService.bulkInsertRoutines(req.user, saveRoutines);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  getRoutine(@Body() getRoutineRequest: GetRoutineRequestDto, @Request() req: any) {
    this.logger.log(`start getRoutine DTO : ${getRoutineRequest.name}`);
    return this.routineService.getRoutineByName(getRoutineRequest, req.user);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  patchRoutine(@Body() updateRoutineRequest: UpdateRoutinesRequestDto, @Request() req: any) {
    return this.routineService.bulkUpdateRoutines(updateRoutineRequest, req.user);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  deleteRoutine(@Body() deleteRoutineRequestDto: DeleteRoutineRequestDto, @Request() req: any) {
    return this.routineService.softDeleteRoutine(deleteRoutineRequestDto, req.user);
  }
}
