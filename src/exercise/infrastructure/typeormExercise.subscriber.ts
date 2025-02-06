import { EntitySubscriberInterface, EventSubscriber, UpdateEvent } from 'typeorm';

import { Exercise } from '../domain/Exercise.entity';
import { WorkoutLog } from '../../workoutLog/domain/WorkoutLog.entity';

@EventSubscriber()
export class ExerciseSubscriber implements EntitySubscriberInterface<Exercise> {
  listenTo() {
    return Exercise;
  }
  async afterUpdate(event: UpdateEvent<Exercise>) {
    if (event.entity && event.updatedColumns.some((col) => col.propertyName === 'exerciseName')) {
      await event.manager
        .createQueryBuilder()
        .update(WorkoutLog)
        .set({ exerciseName: event.entity.exerciseName })
        .where({ exercise: { id: event.entity.id } })
        .execute();
    }
  }
}
