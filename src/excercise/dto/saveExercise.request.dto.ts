import { IsEnum, IsNotEmpty } from 'class-validator';
import { IsExerciseName } from '../../common/validation/isExerciseName.validation';
import { BodyPart } from '../../common/bodyPart.enum';

export class SaveExerciseRequestDto {
  @IsNotEmpty()
  @IsExerciseName()
  exerciseName: string;

  @IsNotEmpty()
  @IsEnum(BodyPart)
  bodyPart: BodyPart;

  constructor(params: { exerciseName: string; bodyPart: BodyPart }) {
    if (params) {
      this.exerciseName = params.exerciseName;
      this.bodyPart = params.bodyPart;
    }
  }
}
