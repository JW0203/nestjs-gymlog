import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from '../domain/Exercise.entity';
import { In, Repository } from 'typeorm';
import { ExerciseRepository } from '../domain/exercise.repository';
import { BodyPart } from '../../common/bodyPart.enum';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { MySqlLock } from '../../common/type/typeormLock.type';
import { NotFoundException } from '@nestjs/common';
import { UpdateExerciseNameRequestDto } from '../dto/updateExerciseName.request.dto';

export class TypeOrmExerciseRepository implements ExerciseRepository {
  constructor(@InjectRepository(Exercise) private exerciseRepository: Repository<Exercise>) {}

  async findOneByExerciseNameAndBodyPart(exerciseName: string, bodyPart: BodyPart): Promise<Exercise | null> {
    return await this.exerciseRepository.findOne({ where: { exerciseName, bodyPart } });
  }

  async findExercisesByExerciseNameAndBodyPart(exercises: ExerciseDataFormatDto[]): Promise<Exercise[]> {
    return await this.exerciseRepository.find({ where: exercises });
  }

  async findExercisesByExerciseNameAndBodyPartLockMode(
    exercises: ExerciseDataFormatDto[],
    lockMode: MySqlLock,
  ): Promise<Exercise[]> {
    return await this.exerciseRepository.find({ where: exercises, lock: lockMode });
  }

  async findAll(): Promise<Exercise[]> {
    return await this.exerciseRepository.find();
  }
  async findExercisesByIds(ids: number[]): Promise<Exercise[]> {
    return await this.exerciseRepository.find({ where: { id: In(ids) } });
  }

  async bulkInsertExercises(exercises: ExerciseDataFormatDto[]): Promise<Exercise[]> {
    const insertedExercises = await this.exerciseRepository.insert(exercises);
    const exerciseIds = insertedExercises.identifiers.map((data) => data.id);
    return await this.exerciseRepository.find({ where: { id: In(exerciseIds) } });
  }

  async bulkSoftDelete(ids: number[]): Promise<void> {
    await this.exerciseRepository.softDelete({ id: In(ids) });
  }

  async changeExerciseName(updateData: UpdateExerciseNameRequestDto): Promise<Exercise> {
    const { originExerciseName, newExerciseName } = updateData;
    const exercise = await this.exerciseRepository.findOne({ where: { exerciseName: originExerciseName } });
    if (!exercise) {
      throw new NotFoundException(`Exercise '${originExerciseName}' not found.`);
    }
    exercise.exerciseName = newExerciseName;

    return await this.exerciseRepository.save(exercise);
  }
}
