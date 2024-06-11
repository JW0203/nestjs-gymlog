import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { Chest } from './Chest.entity';
import { Record } from './Record.entity';

@Entity()
export class RecordToChest extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Record, (record) => record.id)
  record: Record;

  @ManyToOne(() => Chest, (chest) => chest.id)
  chest: Chest;

  constructor();
  constructor(params: { chest: Chest; record: Record });
  constructor(params?: { chest: Chest; record: Record }) {
    super();
    if (params) {
      this.chest = params.chest;
      this.record = params.record;
    }
  }
}
