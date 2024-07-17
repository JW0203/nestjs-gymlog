import { IsEnum, IsNotEmpty } from 'class-validator';
import { BodyPart } from '../bodyPart.enum';
import { IsExerciseName } from '../validation/isExerciseName.validation';
import { Exercise } from '../../excercise/domain/Exercise.entity';

export class ExerciseDataResponseDto {
  @IsNotEmpty()
  @IsEnum(BodyPart)
  bodyPart: BodyPart;

  @IsNotEmpty()
  @IsExerciseName()
  exerciseName: string;

  constructor(exercise: Exercise) {
    this.exerciseName = exercise.exerciseName;
    this.bodyPart = exercise.bodyPart;
  }
}
