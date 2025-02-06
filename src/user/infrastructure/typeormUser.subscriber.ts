import { EntitySubscriberInterface, EventSubscriber, UpdateEvent } from 'typeorm';
import { User } from '../domain/User.entity';
import { WorkoutLog } from '../../workoutLog/domain/WorkoutLog.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  async afterUpdate(event: UpdateEvent<User>) {
    if (event.entity && event.updatedColumns.some((col) => col.propertyName === 'nickName')) {
      await event.manager
        .createQueryBuilder()
        .update(WorkoutLog)
        .set({ userNickName: event.entity.nickName })
        .where({ user: { id: event.entity.id } })
        .execute();
    }
  }
}
