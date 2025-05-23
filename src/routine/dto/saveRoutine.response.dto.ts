export class SaveRoutineResponseDto {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
  updatedAt: string;

  constructor(routine: any) {
    this.id = routine.id;
    this.name = routine.name;
    this.userId = routine.user.id;
    this.createdAt = routine.createdAt;
    this.updatedAt = routine.updatedAt;
  }
}
