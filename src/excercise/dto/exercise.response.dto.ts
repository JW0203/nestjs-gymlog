export class ExerciseResponseDto {
  id: number;
  bodyPart: string;
  exerciseName: string;
  constructor(params: { id: number; bodyPart: string; exerciseName: string }) {
    if (params) {
      this.id = params.id;
      this.bodyPart = params.bodyPart;
      this.exerciseName = params.exerciseName;
    }
  }
}
