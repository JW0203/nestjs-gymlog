import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { Legs } from './Legs.entity';
import { Record } from './Record.entity';

@Entity()
export class RecordToLegs extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Legs, (legs) => legs.id)
  legs: Legs;
  @ManyToOne(() => Record, (record) => record.id)
  record: Record;

  constructor();
  constructor(params: { legs: Legs; record: Record });
  constructor(params?: { legs: Legs; record: Record }) {
    super();
    if (params) {
      this.legs = params.legs;
      this.record = params.record;
    }
  }
}
