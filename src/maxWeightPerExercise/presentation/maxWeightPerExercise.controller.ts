import { MaxWeightPerExerciseService } from '../application/maxWeightPerExercise.service';
import { Controller, Get, HttpCode, Post } from '@nestjs/common';
import { MaxWeightPerExercise } from '../domain/MaxWeightPerExercise.entity';
import { BestWorkoutLog } from '../../workoutLog/dto/findBestWorkoutLogs.response.dto';

@Controller('max-weight-exercise')
export class MaxWeightPerExerciseController {
  constructor(private readonly maxWeightPerExerciseService: MaxWeightPerExerciseService) {}

  @Post()
  @HttpCode(201)
  async renewalMaxWeightPerExercise(): Promise<MaxWeightPerExercise[]> {
    return await this.maxWeightPerExerciseService.renewalMaxWeightPerExercise();
  }

  @Get()
  @HttpCode(200)
  async getBestWorkoutLogs(): Promise<BestWorkoutLog[]> {
    return await this.maxWeightPerExerciseService.getBestWorkoutLogs();
  }
}
