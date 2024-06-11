import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Shoulders } from './Shoulders.entity';
import { Routine } from './Routine.entity';

@Entity()
export class RecordToShouldersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Shoulders, (shoulders) => shoulders.id)
  shoulders: Shoulders;

  @ManyToOne(() => Routine, (routine) => routine.id)
  routine: Routine;
}
