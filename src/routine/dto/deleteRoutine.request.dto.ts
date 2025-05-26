export class SoftDeleteRoutineRequestDto {
  ids: number[];
  constructor(ids: number[]) {
    this.ids = ids;
  }
}
