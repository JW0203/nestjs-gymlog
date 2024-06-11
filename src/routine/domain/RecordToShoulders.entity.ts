import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Shoulders } from './Shoulders.entity';
import { Record } from './Record.entity';
import { Timestamps } from '../../TimeStamp.entity';

@Entity()
export class RecordToShoulders extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Shoulders, (shoulders) => shoulders.id)
  shoulders: Shoulders;

  @ManyToOne(() => Record, (record) => record.id)
  record: Record;

  constructor();
  constructor(params: { shoulders: Shoulders; record: Record });
  constructor(params?: { shoulders: Shoulders; record: Record }) {
    super();
    if (params) {
      this.shoulders = params.shoulders;
      this.record = params.record;
    }
  }
}
