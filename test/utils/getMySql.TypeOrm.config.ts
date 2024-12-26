import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getMySqlTypeOrmConfig = (entities: Function[]): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'password',
  database: 'gymlog_test',
  entities: entities,
  synchronize: true,
  logging: false,
});
