import { IsEnum, IsNotEmpty } from 'class-validator';
import { BodyPart } from '../../common/bodyPart.enum';
import { IsExerciseName } from '../../common/validation/isExerciseName.validation';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';

export class FilteredExerciseDto {
  @IsNotEmpty()
  @IsEnum(BodyPart)
  bodyPart: BodyPart;

  @IsNotEmpty()
  @IsExerciseName()
  exerciseName: string;

  constructor(exercise: ExerciseDataFormatDto) {
    this.exerciseName = exercise.exerciseName;
    this.bodyPart = exercise.bodyPart;
  }
}
