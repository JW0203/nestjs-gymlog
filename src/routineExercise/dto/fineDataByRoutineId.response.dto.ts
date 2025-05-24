import { BodyPart } from '../../common/bodyPart.enum';

export class FineDataByRoutineIdResponseDto {
  routineName: string;
  routines: { order: number; exerciseName: string; bodyPart: BodyPart }[];
}
