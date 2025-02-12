import { MaxWeightPerExercise } from '../domain/MaxWeightPerExercise.entity';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Max_Weight_PerExercise_REPOSITORY } from '../../common/const/inject.constant';
import { MaxWeightPerExerciseRepository } from '../domain/maxWeightPerExercise.repository';
import { FindMaxWeightRequestDto } from '../dto/findMaxWeight.request.dto';
import { UpdateExerciseNameRequestDto } from '../../exercise/dto/updateExerciseName.request.dto';
import { UpdateUserNickNameInMaxWeightRequestDto } from '../dto/updateUserNickNameInMaxWeight.request.dto';
import { WorkoutLogService } from '../../workoutLog/application/workoutLog.service';
import { BestWorkoutLog } from '../../workoutLog/dto/findBestWorkoutLogs.response.dto';

@Injectable()
export class MaxWeightPerExerciseService {
  constructor(
    @Inject(Max_Weight_PerExercise_REPOSITORY)
    readonly maxWeightPerExerciseRepository: MaxWeightPerExerciseRepository,

    @Inject(forwardRef(() => WorkoutLogService))
    private readonly workoutLogService: WorkoutLogService,
  ) {}

  async findMaxWeight(data: FindMaxWeightRequestDto): Promise<MaxWeightPerExercise | null> {
    return await this.maxWeightPerExerciseRepository.findMaxWeight(data);
  }

  async bulkSaveMaxWeightPerExercise(entities: MaxWeightPerExercise[]): Promise<MaxWeightPerExercise[]> {
    return await this.maxWeightPerExerciseRepository.bulkSaveMaxWeightPerExercise(entities);
  }

  async updateExerciseNameInMaxWeight(updateData: UpdateExerciseNameRequestDto): Promise<any> {
    return await this.maxWeightPerExerciseRepository.updateExerciseNameInMaxWeight(updateData);
  }

  async updateUserNickNameInMaxWeight(
    updateUserNickNameRequestDto: UpdateUserNickNameInMaxWeightRequestDto,
  ): Promise<any> {
    return await this.updateUserNickNameInMaxWeight(updateUserNickNameRequestDto);
  }

  async renewalMaxWeightPerExercise(): Promise<MaxWeightPerExercise[]> {
    await this.maxWeightPerExerciseRepository.clearTable();
    const renewalData = await this.workoutLogService.getBestWorkoutLogs();
    return await this.maxWeightPerExerciseRepository.renewalMaxWeightPerExercise(renewalData);
  }

  async getBestWorkoutLogs(): Promise<BestWorkoutLog[]> {
    const result = await this.maxWeightPerExerciseRepository.getBestWorkoutLogs();
    return result.map(
      (data) =>
        new BestWorkoutLog({
          exerciseName: data.exerciseName,
          bodyPart: data.bodyPart,
          maxWeight: data.maxWeight,
          achieveDate: data.achieveDate,
          userNickName: data.userNickName,
        }),
    );
  }
}
