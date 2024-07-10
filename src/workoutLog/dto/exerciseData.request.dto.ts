import { BodyPart } from '../../excercise/domain/bodyPart.enum';
import { IsEnum, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class ExerciseDataRequestDto {
  @IsNotEmpty()
  @IsEnum(BodyPart)
  bodyPart: BodyPart;

  @IsNotEmpty()
  @IsString()
  @Length(3, 50, {
    message: 'Exercise name must be between 3 and 50 characters',
  })
  @Matches(/^[a-zA-Z0-9 ]*$/, {
    message: 'Exercise name can only contain letters, numbers, and spaces',
  })
  exerciseName: string;
}
