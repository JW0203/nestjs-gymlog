import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { BodyPart } from '../bodyPart.enum';
import { IsExerciseName } from '../validation/isExerciseName.validation';
import { Exercise } from '../../exercise/domain/Exercise.entity';

export class ExerciseDataResponseDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsEnum(BodyPart)
  bodyPart: BodyPart;

  @IsNotEmpty()
  @IsExerciseName()
  exerciseName: string;

  constructor(exercise: Exercise) {
    this.id = exercise.id;
    this.exerciseName = exercise.exerciseName;
    this.bodyPart = exercise.bodyPart;
  }
}
