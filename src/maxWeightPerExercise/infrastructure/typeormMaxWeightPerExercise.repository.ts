import { MaxWeightPerExercise } from '../domain/MaxWeightPerExercise.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MaxWeightPerExerciseRepository } from '../domain/maxWeightPerExercise.repository';
import { FindMaxWeightRequestDto } from '../dto/findMaxWeight.request.dto';
import { Repository } from 'typeorm';
import { UpdateExerciseNameRequestDto } from '../../exercise/dto/updateExerciseName.request.dto';
import { UpdateUserNickNameInMaxWeightRequestDto } from '../dto/updateUserNickNameInMaxWeight.request.dto';
import { BestWorkoutLog } from '../../workoutLog/dto/findBestWorkoutLogs.response.dto';

export class TypeormMaxWeightPerExerciseRepository implements MaxWeightPerExerciseRepository {
  constructor(
    @InjectRepository(MaxWeightPerExercise)
    private maxWeightPerExerciseRepository: Repository<MaxWeightPerExercise>,
  ) {}

  async findMaxWeight(data: FindMaxWeightRequestDto): Promise<any> {
    const { exerciseName, bodyPart } = data;
    return await this.maxWeightPerExerciseRepository.findOne({ where: { exerciseName, bodyPart } });
  }

  async bulkSaveMaxWeightPerExercise(saveData: MaxWeightPerExercise[]): Promise<MaxWeightPerExercise[]> {
    return await this.maxWeightPerExerciseRepository.save(saveData);
  }

  async updateExerciseNameInMaxWeight(updateData: UpdateExerciseNameRequestDto): Promise<any> {
    const { originExerciseName, newExerciseName } = updateData;
    return await this.maxWeightPerExerciseRepository
      .createQueryBuilder('wl')
      .update()
      .set({ exerciseName: newExerciseName })
      .where({ exerciseName: originExerciseName })
      .execute();
  }

  async updateUserNickNameInMaxWeight(
    updateUserNickNameRequestDto: UpdateUserNickNameInMaxWeightRequestDto,
  ): Promise<any> {
    const { newNickName, oldNickName } = updateUserNickNameRequestDto;
    return await this.maxWeightPerExerciseRepository
      .createQueryBuilder()
      .update()
      .set({ userNickName: newNickName })
      .where({ userNickName: oldNickName })
      .execute();
  }

  async renewalMaxWeightPerExercise(renewalData: BestWorkoutLog[]): Promise<MaxWeightPerExercise[]> {
    return await this.maxWeightPerExerciseRepository.save(renewalData);
  }

  async clearTable(): Promise<void> {
    await this.maxWeightPerExerciseRepository.query('TRUNCATE TABLE max_weight_per_exercise');
  }

  async getBestWorkoutLogs(): Promise<MaxWeightPerExercise[]> {
    return await this.maxWeightPerExerciseRepository.find({
      order: { bodyPart: 'DESC' },
    });
  }
}
