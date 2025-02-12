import { IsEnum, IsNotEmpty } from 'class-validator';
import { Column } from 'typeorm';
import { IsExerciseName } from '../../common/validation/isExerciseName.validation';
import { BodyPart } from '../../common/bodyPart.enum';

export class FindMaxWeightRequestDto {
  @IsNotEmpty()
  @Column()
  @IsExerciseName()
  exerciseName: string;

  @IsNotEmpty()
  @IsEnum(BodyPart)
  @Column({ type: 'enum', enum: BodyPart })
  bodyPart: BodyPart;

  constructor(params: { exerciseName: string; bodyPart: BodyPart }) {
    if (params) {
      this.exerciseName = params.exerciseName;
      this.bodyPart = params.bodyPart;
    }
  }
}
