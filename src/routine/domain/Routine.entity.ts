import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { User } from '../../user/domain/User.entity';
import { validateOrReject } from 'class-validator';
import { Logger } from '@nestjs/common';
import { RoutineExercise } from '../../routineExercise/domain/RoutineExercise.entity';

@Entity()
export class Routine extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.routines)
  public user: User;

  @OneToMany(() => RoutineExercise, (RoutineExercise) => RoutineExercise.routine)
  public routineExercise: RoutineExercise[];

  constructor(params: { name: string; user: User }) {
    super();
    if (params) {
      this.name = params.name;
      this.user = params.user;

      validateOrReject(this).catch((errors) => {
        console.log('(Routine entity validation failed). Errors: ', errors);
      });
    }
  }

  update(params: { name: string; user: User; routineExercise: RoutineExercise[] }) {
    this.name = params.name;
    this.user = params.user;
    this.routineExercise = params.routineExercise;

    validateOrReject(this).catch((errors) => {
      const logger = new Logger('Routine Entity Update');
      logger.error('Validation failed during update.', errors);
      throw errors;
    });
  }
}
