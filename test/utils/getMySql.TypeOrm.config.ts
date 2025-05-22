import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { WorkoutLog } from '../../src/workoutLog/domain/WorkoutLog.entity';
import { Exercise } from '../../src/exercise/domain/Exercise.entity';
import { Routine } from '../../src/routine/domain/Routine.entity';
import { User } from '../../src/user/domain/User.entity';
import { RoutineExercise } from '../../src/routineExercise/domain/RoutineExercise.entity';

export const getMySqlTypeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'password',
  database: 'gymlog_test',
  entities: [User, Routine, Exercise, WorkoutLog, RoutineExercise],
  synchronize: true,
  logging: false,
});
