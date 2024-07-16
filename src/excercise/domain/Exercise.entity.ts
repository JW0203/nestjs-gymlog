import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { WorkoutLog } from '../../workoutLog/domain/WorkoutLog.entity';
import { IsEnum, IsNotEmpty, validateOrReject } from 'class-validator';
import { BodyPart } from '../../common/bodyPart.enum';
import { IsExerciseName } from '../../common/validation/isExerciseName.validation';
import { Routine } from '../../routine/domain/Routine.entity';

@Entity()
@Unique(['bodyPart', 'exerciseName'])
export class Exercise extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsEnum(BodyPart)
  @Column({ type: 'enum', enum: BodyPart })
  bodyPart: BodyPart;

  @IsNotEmpty()
  @Column()
  @IsExerciseName()
  exerciseName: string;

  @OneToMany(() => WorkoutLog, (workoutLog) => workoutLog.exercise)
  workoutLogs: WorkoutLog[];

  @OneToMany(() => Routine, (routine) => routine.exercise)
  routines: Routine[];

  constructor();
  constructor(params: { bodyPart: BodyPart; exerciseName: string });
  constructor(params?: { bodyPart: BodyPart; exerciseName: string }) {
    super();
    if (params) {
      this.exerciseName = params.exerciseName;
      this.bodyPart = params.bodyPart;
      validateOrReject(this).catch((errors) => {
        console.log('(Exercise entity validation failed). Errors: ', errors);
      });
    }
  }
}
