import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { User } from '../../user/domain/User.entity';
import { validateOrReject } from 'class-validator';
import { Exercise } from '../../excercise/domain/Exercise.entity';
import { Logger } from '@nestjs/common';

@Entity()
export class Routine extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.routines)
  public user: User;

  @ManyToOne(() => Exercise, (Exercise) => Exercise.routines)
  public exercise: Exercise;

  constructor(params: { name: string; user: User; exercise: Exercise }) {
    super();
    if (params) {
      this.name = params.name;
      this.user = params.user;
      this.exercise = params.exercise;

      validateOrReject(this).catch((errors) => {
        console.log('(Routine entity validation failed). Errors: ', errors);
      });
    }
  }

  update(params: { name: string; user: User; exercise: Exercise }) {
    this.name = params.name;
    this.user = params.user;
    this.exercise = params.exercise;

    validateOrReject(this).catch((errors) => {
      const logger = new Logger('Routine Entity Update');
      logger.error('Validation failed during update.', errors);
      throw errors;
    });
  }
}
