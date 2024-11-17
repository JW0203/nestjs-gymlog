import { QueryRunner } from 'typeorm';

export async function clearAndResetTable(queryRunner: QueryRunner, target: string) {
  if (!isValidTableName(target)) {
    throw new Error(`Invalid table name: ${target}`);
  }
  await queryRunner.query(`DELETE FROM ${target}`);
  await queryRunner.query(`ALTER TABLE ${target} AUTO_INCREMENT = 1`);
}

function isValidTableName(tableName: string): boolean {
  const validTables = ['user', 'routine', 'exercise', 'workoutLog'];
  return validTables.includes(tableName);
}
