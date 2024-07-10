import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ExerciseService } from '../application/exercise.service';
import { SaveExerciseRequestDto } from '../dto/saveExercise.request.dto';

@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.exerciseService.softDelete(parseInt(id));
  }

  @Post()
  save(@Body() saveExerciseRequestDto: SaveExerciseRequestDto[]) {
    return this.exerciseService.bulkInsertExercises(saveExerciseRequestDto);
  }

  @Get()
  get(@Body() saveExerciseRequestDto: SaveExerciseRequestDto) {
    return this.exerciseService.findByExerciseNameAndBodyPart(saveExerciseRequestDto);
  }

  @Get('all')
  getAll(@Body() saveExerciseRequestDto: SaveExerciseRequestDto[]) {
    return this.exerciseService.findAll(saveExerciseRequestDto);
  }
}
