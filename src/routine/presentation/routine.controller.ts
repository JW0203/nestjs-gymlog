import { Body, Controller, Delete, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { RoutineService } from '../application/routine.service';
import { JwtAuthGuard } from '../../common/jwtPassport/jwtAuth.guard';
import { SaveRoutineRequestDto } from '../dto/saveRoutine.request.dto';
import { GetRoutineRequestDto } from '../dto/getRoutine.request.dto';
import { PatchRoutineRequestDto } from '../dto/patchRoutine.request.dto';
import { DeleteRoutineRequestDto } from '../dto/deleteRoutine.request.dto';
import { User } from '../../user/domain/User.entity';

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

  @Patch()
  @UseGuards(JwtAuthGuard)
  patchRoutine(@Body() patchRoutineRequestDto: PatchRoutineRequestDto, @Request() req: any) {
    return this.routineService.patchRoutine(patchRoutineRequestDto, req.user);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  deleteRoutine(@Body() deleteRoutineRequestDto: DeleteRoutineRequestDto, @Request() req: any) {
    return this.routineService.softDeleteRoutine(deleteRoutineRequestDto, req.user);
  }
}
