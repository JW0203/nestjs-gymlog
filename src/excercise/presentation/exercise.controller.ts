import { Controller, Delete, Param } from '@nestjs/common';
import { ExerciseService } from '../application/exercise.service';

@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.exerciseService.softDelete(parseInt(id));
  }
}
