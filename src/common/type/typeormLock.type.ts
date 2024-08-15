export type pessimisticLockModeType =
  | 'pessimistic_read'
  | 'pessimistic_write'
  | 'dirty_read'
  | 'pessimistic_partial_write'
  | 'pessimistic_write_or_fail'
  | 'for_no_key_update'
  | 'for_key_share';
export type OptimisticLock = {
  mode: 'optimistic';
  version: number | Date;
};

export type PessimisticLock = {
  mode: pessimisticLockModeType;
  tables?: string[];
  onLocked?: 'nowait' | 'skip_locked';
};

export type MySqlLock = OptimisticLock | PessimisticLock;
