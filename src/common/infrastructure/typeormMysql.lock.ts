import { LockConfig } from '../type/lock.type';

export class LockConfigManager {
  // 데이터베이스별 Lock 설정
  private static lockConfigs: Record<string, LockConfig> = {
    mySQLPessimistic: {
      mode: 'pessimistic_write',
    },

    mySQLOptimistic: {
      mode: 'optimistic',
      version: new Date(),
    },
  };

  static setLockConfig(databaseName: string, lockConfig: LockConfig): LockConfig {
    return (this.lockConfigs[databaseName] = lockConfig);
  }
}
