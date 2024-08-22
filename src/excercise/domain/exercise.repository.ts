import { Exercise } from './Exercise.entity';
import { BodyPart } from '../../common/bodyPart.enum';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { MySqlLock } from '../../common/type/typeormLock.type';

export interface ExerciseRepository {
  findOneByExerciseNameAndBodyPart(exerciseName: string, bodyPart: BodyPart): Promise<Exercise | null>;
  findExercisesByExerciseNameAndBodyPart(exercises: ExerciseDataFormatDto[]): Promise<Exercise[]>;
  findExercisesByExerciseNameAndBodyPartLockMode(
    exercises: ExerciseDataFormatDto[],
    lockMode: MySqlLock,
  ): Promise<Exercise[]>;
  findAll(): Promise<Exercise[]>;
  findExercisesByIds(ids: number[]): Promise<Exercise[]>;
  bulkInsertExercises(exercises: ExerciseDataFormatDto[]): Promise<Exercise[]>;
  bulkSoftDelete(ids: number[]): Promise<void>;
}
