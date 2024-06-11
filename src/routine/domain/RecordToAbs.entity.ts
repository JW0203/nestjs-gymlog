import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Abs } from './Abs.entity';
import { Timestamps } from '../../TimeStamp.entity';
import { Record } from './Record.entity';

@Entity()
export class UserToAbs extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Abs, (abs) => abs.id)
  abs: Abs;

  @ManyToOne(() => Record, (record) => record.id)
  record: Record;

  constructor();
  constructor(params: { abs: Abs; record: Record });
  constructor(params?: { abs: Abs; record: Record }) {
    super();
    if (params) {
      this.abs = params.abs;
      this.record = params.record;
    }
  }
}
