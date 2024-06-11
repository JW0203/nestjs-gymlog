import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Record } from './Record.entity';
import { Back } from './Back.entity';
import { Timestamps } from '../../TimeStamp.entity';

@Entity()
export class RecordToBack extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Record, (record) => record.id)
  record: Record;

  @ManyToOne(() => Back, (back) => back.id)
  back: Back;

  constructor();
  constructor(params: { back: Back; record: Record });
  constructor(params?: { back: Back; record: Record }) {
    super();
    if (params) {
      this.back = params.back;
      this.record = params.record;
    }
  }
}
