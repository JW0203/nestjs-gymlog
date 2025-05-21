import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { WorkoutLog } from '../../workoutLog/domain/WorkoutLog.entity';
import { IsEnum, IsNotEmpty, validate } from 'class-validator';
import { BodyPart } from '../../common/bodyPart.enum';
import { IsExerciseName } from '../../common/validation/isExerciseName.validation';
import { Routine } from '../../routine/domain/Routine.entity';
import { Logger } from '@nestjs/common';
import { RoutineExercise } from '../../routineExercise/domain/RoutineExercise.entity';

@Entity()
@Index('idx_exercise_deleted_id', ['deletedAt', 'id'])
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

  @OneToMany(() => RoutineExercise, (RoutineExercise) => RoutineExercise.exercise)
  public routineExercise: RoutineExercise[];

  constructor(params: { bodyPart: BodyPart; exerciseName: string }) {
    super();
    if (params) {
      this.exerciseName = params.exerciseName;
      this.bodyPart = params.bodyPart;
      validate(this).then((errors) => {
        const logger = new Logger('Exercise Entity');
        if (errors.length > 0) {
          logger.log('(Exercise entity validation failed). errors:', errors);
        } else {
          logger.log('(Exercise entity validation succeed)');
        }
      });
    }
  }
}
