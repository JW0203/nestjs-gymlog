import { Injectable, Inject } from '@nestjs/common';
import { SoftDeleteWorkoutLogRequestDto } from '../dto/softDeleteWorkoutLog.request.dto';
import { User } from '../../user/domain/User.entity';
import { SaveWorkoutLogsRequestDto } from '../dto/saveWorkoutLogs.request.dto';
import { UpdateWorkoutLogsRequestDto } from '../dto/updateWorkoutLogs.request.dto';
import { WorkoutLogResponseDto } from '../dto/workoutLog.response.dto';
import { WORKOUTLOG_REPOSITORY } from '../../common/const/inject.constant';
import { WorkoutRepository } from '../domain/workout.repository';

@Injectable()
export class WorkoutLogService {
  constructor(
    @Inject(WORKOUTLOG_REPOSITORY)
    readonly workoutLogRepository: WorkoutRepository,
  ) {}

  async bulkInsertWorkoutLogs(userId: number, saveWorkoutLogs: SaveWorkoutLogsRequestDto): Promise<any> {
    return await this.workoutLogRepository.bulkInsertWorkoutLogs(userId, saveWorkoutLogs);
  }

  async getWorkoutLogsByDay(date: string, userId: number): Promise<WorkoutLogResponseDto[]> {
    return await this.workoutLogRepository.getWorkoutLogsByDay(date, userId);
  }

  async bulkUpdateWorkoutLogs(
    userId: number,
    updateWorkoutLogsRequest: UpdateWorkoutLogsRequestDto,
  ): Promise<WorkoutLogResponseDto[]> {
    return this.workoutLogRepository.bulkUpdateWorkoutLogs(userId, updateWorkoutLogsRequest);
  }

  async softDeleteWorkoutLogs(softDeleteRequestDto: SoftDeleteWorkoutLogRequestDto, user: User): Promise<void> {
    await this.workoutLogRepository.softDeleteWorkoutLogs(softDeleteRequestDto, user);
  }

  async getWorkoutLogByUser(user: User): Promise<object> {
    return await this.workoutLogRepository.getWorkoutLogByUser(user);
  }
}
