import { Exercise } from './Exercise.entity';
import { BodyPart } from '../../common/bodyPart.enum';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { SaveExercisesRequestDto } from '../dto/saveExercises.request.dto';
import { ExerciseDataResponseDto } from '../../common/dto/exerciseData.response.dto';
import { DeleteExerciseRequestDto } from '../dto/deleteExercise.request.dto';

export interface ExerciseRepository {
  findOneByExerciseNameAndBodyPart(exerciseName: string, bodyPart: BodyPart): Promise<Exercise | null>;
  findExercisesByExerciseNameAndBodyPart(exercisesData: ExerciseDataFormatDto[], lock?: boolean): Promise<Exercise[]>;
  findAll(): Promise<Exercise[]>;
  findNewExercises(exerciseDataArray: SaveExercisesRequestDto): Promise<ExerciseDataResponseDto[]>;
  bulkInsertExercises(exerciseDataArray: SaveExercisesRequestDto): Promise<ExerciseDataResponseDto[]>;
  bulkSoftDelete(deleteExerciseRequestDto: DeleteExerciseRequestDto): any;
}
