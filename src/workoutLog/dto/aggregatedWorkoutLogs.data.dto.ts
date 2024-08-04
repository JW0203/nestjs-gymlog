interface ExerciseDataDTO {
  [exercise: string]: number[];
}

interface BodyPartDataDTO {
  [bodyPart: string]: ExerciseDataDTO;
}

interface YearlyDataDTO {
  [year: number]: BodyPartDataDTO;
}

interface MonthlyDataDTO {
  [month: number]: BodyPartDataDTO;
}

export class AggregatedResultDTO {
  year: YearlyDataDTO;
  month: MonthlyDataDTO;

  constructor() {
    this.year = {};
    this.month = {};
  }
}
