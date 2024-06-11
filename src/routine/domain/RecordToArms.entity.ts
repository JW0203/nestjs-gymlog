import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Arms } from './Arms.entity';
import { Record } from './Record.entity';
import { Timestamps } from '../../TimeStamp.entity';

@Entity()
export class UserToArms extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Arms, (arms) => arms.id)
  arms: Arms;

  @ManyToOne(() => Record, (record) => record.id)
  record: Record;

  constructor();
  constructor(params: { arms: Arms; record: Record });
  constructor(params?: { arms: Arms; record: Record }) {
    super();
    if (params) {
      this.arms = params.arms;
      this.record = params.record;
    }
  }
}
