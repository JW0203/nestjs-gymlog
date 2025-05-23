import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';

export class SaveRoutineRequestDto {
  routineName: string;
  exercises: ExerciseDataFormatDto[];
}
