import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { Record } from '../../routine/domain/Record.entity';

@Entity()
export class User extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @OneToMany(() => Record, (record) => record.id)
  public record: Record[];

  constructor(params: { email: string; password: string; name: string }) {
    super();
    if (params) {
      this.email = params.email;
      this.password = params.password;
      this.name = params.name;
    }
  }
}
