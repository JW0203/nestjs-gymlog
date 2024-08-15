import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GetExercisesRequestDto {
  @ValidateNested({ each: true })
  @Type(() => ExerciseDataFormatDto)
  exercises: ExerciseDataFormatDto[];

  @IsBoolean()
  lock: boolean | null;
}
