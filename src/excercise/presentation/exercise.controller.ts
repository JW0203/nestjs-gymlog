import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
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
  @HttpCode(201)
  save(@Body() saveExerciseRequestDto: SaveExerciseRequestDto[]) {
    return this.exerciseService.bulkInsertExercises(saveExerciseRequestDto);
  }

  @Get()
  @HttpCode(200)
  get(@Body() saveExerciseRequestDto: SaveExerciseRequestDto) {
    return this.exerciseService.findByExerciseNameAndBodyPart(saveExerciseRequestDto);
  }

  @Get('all')
  @HttpCode(200)
  getAll(@Body() saveExerciseRequestDto: SaveExerciseRequestDto[]) {
    return this.exerciseService.findAll(saveExerciseRequestDto);
  }
}
