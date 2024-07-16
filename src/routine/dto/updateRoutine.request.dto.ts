import { PatchRoutineDataInfoDto } from './patchRoutine.dataInfo.dto';

export class PatchRoutineRequestDto {
  routineName: string;
  dataArray: PatchRoutineDataInfoDto[];
}
