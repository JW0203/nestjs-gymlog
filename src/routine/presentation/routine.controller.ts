import { Body, Controller, Delete, Get, HttpCode, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { RoutineService } from '../application/routine.service';
import { JwtAuthGuard } from '../../common/jwtPassport/jwtAuth.guard';
import { GetRoutineByNameRequestDto } from '../dto/getRoutineByName.request.dto';
import { UpdateRoutinesRequestDto } from '../dto/updateRoutines.request.dto';
import { SoftDeleteRoutineRequestDto } from '../dto/deleteRoutine.request.dto';
import { SaveRoutineRequestDto } from '../dto/saveRoutine.request.dto';

@Controller('routines')
export class RoutineController {
  constructor(private readonly routineService: RoutineService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  postRoutine(@Body() saveRoutine: SaveRoutineRequestDto, @Request() req: any) {
    return this.routineService.saveRoutine(saveRoutine, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  getRoutine(@Query() getRoutineByName: GetRoutineByNameRequestDto, @Request() req: any) {
    return this.routineService.getRoutineByName(getRoutineByName, req.user);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  getAllRoutineByUser(@Request() req: any) {
    return this.routineService.getAllRoutinesByUser(req.user);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  patchRoutine(@Body() updateRoutineRequest: UpdateRoutinesRequestDto, @Request() req: any) {
    return this.routineService.updateRoutine(updateRoutineRequest, req.user);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  deleteRoutine(@Body() softDeleteRoutineRequestDto: SoftDeleteRoutineRequestDto, @Request() req: any) {
    return this.routineService.softDeleteRoutine(softDeleteRoutineRequestDto, req.user);
  }
}
