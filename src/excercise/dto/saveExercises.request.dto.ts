import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';

export class ExerciseDataArrayRequestDto {
  @ValidateNested({ each: true })
  @Type(() => ExerciseDataFormatDto)
  exercises: ExerciseDataFormatDto[];
}
