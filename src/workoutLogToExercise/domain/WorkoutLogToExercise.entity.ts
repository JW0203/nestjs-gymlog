import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WorkoutLog } from '../../workoutLog/domain/WorkoutLog.entity';
import { Exercise } from '../../excercise/domain/Exercise.entity';

@Entity()
export class WorkoutLogToExercise {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WorkoutLog, (workoutLog) => workoutLog.workoutLogToExercises)
  public workoutLog: WorkoutLog;

  @ManyToOne(() => Exercise, (exercise) => exercise.workoutLogToExercises)
  public exercise: Exercise;
}
