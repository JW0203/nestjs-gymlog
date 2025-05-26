export class SoftDeleteRoutineExercisesRequestDto {
  routineIds: number[];

  constructor(routineIds: number[]) {
    this.routineIds = routineIds;
  }
}
