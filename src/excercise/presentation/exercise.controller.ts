import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ExerciseService } from '../application/exercise.service';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { SaveExercisesRequestDto } from '../dto/saveExercises.request.dto';

@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Delete(':id')
  @HttpCode(204)
  softDelete(@Param('id') id: string) {
    return this.exerciseService.softDelete(parseInt(id));
  }

  @Post('all')
  @HttpCode(201)
  saveArray(@Body() exerciseDataArray: SaveExercisesRequestDto) {
    return this.exerciseService.bulkInsertExercises(exerciseDataArray);
  }

  @Get()
  @HttpCode(200)
  get(@Body() exerciseData: ExerciseDataFormatDto) {
    return this.exerciseService.findByExerciseNameAndBodyPart(exerciseData);
  }

  @Get('all')
  @HttpCode(200)
  getAll(@Body() exerciseDataArray: ExerciseDataFormatDto[]) {
    return this.exerciseService.findAll(exerciseDataArray);
  }
}
