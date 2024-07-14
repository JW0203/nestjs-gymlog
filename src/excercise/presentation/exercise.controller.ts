import { Body, Controller, Delete, Get, HttpCode, Param, Post, ValidationPipe } from '@nestjs/common';
import { ExerciseService } from '../application/exercise.service';
import { SaveExerciseRequestDto } from '../dto/saveExercise.request.dto';
import { ExerciseDataRequestDto } from '../../common/dto/exerciseData.request.dto';

@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Delete(':id')
  @HttpCode(204)
  softDelete(@Param('id') id: string) {
    return this.exerciseService.softDelete(parseInt(id));
  }

  @Post()
  @HttpCode(201)
  saveOne(@Body() saveExerciseRequestDto: SaveExerciseRequestDto) {
    return this.exerciseService.saveExercise(saveExerciseRequestDto);
  }

  @Post('all')
  @HttpCode(201)
  save(@Body(ValidationPipe) saveExerciseRequestDto: SaveExerciseRequestDto[]) {
    return this.exerciseService.bulkInsertExercises(saveExerciseRequestDto);
  }

  @Get()
  @HttpCode(200)
  get(@Body() exerciseDataRequestDto: ExerciseDataRequestDto) {
    return this.exerciseService.findByExerciseNameAndBodyPart(exerciseDataRequestDto);
  }

  @Get('all')
  @HttpCode(200)
  getAll(@Body() exerciseDataRequestDtoArray: ExerciseDataRequestDto[]) {
    return this.exerciseService.findAll(exerciseDataRequestDtoArray);
  }
}
