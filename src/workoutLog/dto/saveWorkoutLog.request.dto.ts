import { BodyPart } from '../../excercise/domain/bodyPart.enum';
import { IsEnum, IsInt, IsNotEmpty, IsString, Length, Matches, Min } from 'class-validator';

export class SaveWorkoutLogRequestDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 50, {
    message: 'Exercise name must be between 3 and 50 characters',
  })
  @Matches(/^[a-zA-Z0-9 ]*$/, {
    message: 'Exercise name can only contain letters, numbers, and spaces',
  })
  exerciseName: string;

  @IsEnum(BodyPart)
  bodyPart: BodyPart;

  @IsInt()
  @Min(1)
  set: number;

  @IsInt()
  @Min(1)
  weight: number;

  @IsInt()
  @Min(1)
  repeat: number;
}
