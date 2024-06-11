import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Routine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  bodyPart: string;

  @Column()
  excersiseName: string;
}
