import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { RoutineService } from '../application/routine.service';
import { JwtAuthGuard } from '../../common/jwtPassport/jwtAuth.guard';
import { SaveRoutineRequestDto } from '../dto/saveRoutine.request.dto';
import { GetRoutineRequestDto } from '../dto/getRoutine.request.dto';

@Controller('routines')
export class RoutineController {
  constructor(private readonly routineService: RoutineService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  postRoutine(@Body() saveRoutineRequestDtoArray: SaveRoutineRequestDto[], @Request() req: any) {
    return this.routineService.saveRoutine(req.user, saveRoutineRequestDtoArray);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getRoutine(@Body() getRoutineRequest: GetRoutineRequestDto, @Request() req: any) {
    return this.routineService.getRoutineByName(getRoutineRequest, req.user);
  }
}