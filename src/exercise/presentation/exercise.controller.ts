import { Body, Controller, Delete, Get, HttpCode, Patch, Post, Query } from '@nestjs/common';
import { ExerciseService } from '../application/exercise.service';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { SaveExercisesRequestDto } from '../dto/saveExercises.request.dto';
import { DeleteExerciseRequestDto } from '../dto/deleteExercise.request.dto';
import { UpdateExerciseNameRequestDto } from '../dto/updateExerciseName.request.dto';

@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Delete()
  @HttpCode(204)
  softDelete(@Body() deleteExerciseRequestDto: DeleteExerciseRequestDto) {
    return this.exerciseService.bulkSoftDelete(deleteExerciseRequestDto);
  }

  @Post()
  @HttpCode(201)
  saveExercises(@Body() exerciseDataArray: SaveExercisesRequestDto) {
    return this.exerciseService.bulkInsertExercises(exerciseDataArray);
  }

  @Get()
  @HttpCode(200)
  getExerciseByNameAndBodyPart(@Query() exerciseData: ExerciseDataFormatDto) {
    return this.exerciseService.findOneByExerciseNameAndBodyPart(exerciseData);
  }

  @Get('all')
  @HttpCode(200)
  getAll() {
    return this.exerciseService.findAll();
  }

  @Patch('update')
  @HttpCode(200)
  updateExerciseName(@Body() updateData: UpdateExerciseNameRequestDto) {
    return this.exerciseService.changeExerciseName(updateData);
  }
}
