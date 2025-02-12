import { MaxWeightPerExerciseService } from '../application/maxWeightPerExercise.service';
import { Controller, Post } from '@nestjs/common';
import { MaxWeightPerExercise } from '../domain/MaxWeightPerExercise.entity';

@Controller('max-weight-exercise')
export class MaxWeightPerExerciseController {
  constructor(private readonly maxWeightPerExerciseService: MaxWeightPerExerciseService) {}

  @Post()
  async renewalMaxWeightPerExercise(): Promise<MaxWeightPerExercise[]> {
    return await this.maxWeightPerExerciseService.renewalMaxWeightPerExercise();
  }
}
