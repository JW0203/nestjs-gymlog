import { Injectable, Inject, NotFoundException, forwardRef } from '@nestjs/common';
import { SoftDeleteWorkoutLogRequestDto } from '../dto/softDeleteWorkoutLog.request.dto';
import { User } from '../../user/domain/User.entity';
import { SaveWorkoutLogsRequestDto } from '../dto/saveWorkoutLogs.request.dto';
import { UpdateWorkoutLogsRequestDto } from '../dto/updateWorkoutLogs.request.dto';
import { WorkoutLogResponseDto } from '../dto/workoutLog.response.dto';
import { WORKOUTLOG_REPOSITORY } from '../../common/const/inject.constant';
import { WorkoutLogRepository } from '../domain/workoutLog.repository';
import { Transactional } from 'typeorm-transactional';
import { WorkoutLog } from '../domain/WorkoutLog.entity';
import { ExerciseService } from '../../exercise/application/exercise.service';
import { UserService } from '../../user/application/user.service';
import { GetWorkoutLogByUserResponseDto } from '../dto/getWorkoutLogByUser.response.dto';
import { Exercise } from '../../exercise/domain/Exercise.entity';
import { BestWorkoutLog } from '../dto/findBestWorkoutLogs.response.dto';
import { UpdateExerciseNameRequestDto } from '../../exercise/dto/updateExerciseName.request.dto';
import { UpdateUserNickNameInWorkOutLogRequestDto } from '../dto/updateUserNickNameInWorkoutLog.request.dto';

interface UpdateWorkoutLogsParams {
  workoutLogMap: Map<number, WorkoutLog>;
  foundExercises: Exercise[];
  updateWorkoutLogs: {
    id: number;
    setCount: number;
    repeatCount: number;
    weight: number;
    exerciseName: string;
    bodyPart: string;
  }[];
  user: User;
}

export async function updateWorkoutLogsWithValidation({
  workoutLogMap,
  foundExercises,
  updateWorkoutLogs,
  user,
}: UpdateWorkoutLogsParams): Promise<WorkoutLog[]> {
  return Promise.all(
    updateWorkoutLogs.map(async (workoutLog) => {
      const { id, setCount, repeatCount, weight, exerciseName, bodyPart } = workoutLog;

      const exercise = foundExercises.find(
        (exercise) => exercise.exerciseName === exerciseName && exercise.bodyPart === bodyPart,
      );
      if (!exercise) {
        throw new NotFoundException(`Cannot find exercise "${exerciseName}" for body part "${bodyPart}"`);
      }

      const foundWorkoutLog = workoutLogMap.get(id);
      if (!foundWorkoutLog) {
        throw new NotFoundException(`WorkoutLog with id "${id}" not found`);
      }

      foundWorkoutLog.update({
        setCount,
        weight,
        repeatCount,
        user,
        exercise,
        bodyPart: exercise.bodyPart,
        userNickName: user.nickName,
        exerciseName: exercise.exerciseName,
      });

      return foundWorkoutLog;
    }),
  );
}

@Injectable()
export class WorkoutLogService {
  constructor(
    @Inject(WORKOUTLOG_REPOSITORY)
    readonly workoutLogRepository: WorkoutLogRepository,
    @Inject(forwardRef(() => ExerciseService))
    private readonly exerciseService: ExerciseService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  @Transactional()
  async bulkInsertWorkoutLogs(userId: number, saveWorkoutLogs: SaveWorkoutLogsRequestDto): Promise<any> {
    const { workoutLogs } = saveWorkoutLogs;
    const exercises = workoutLogs.map(({ bodyPart, exerciseName }) => ({ bodyPart, exerciseName }));

    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newExercises = await this.exerciseService.findNewExercises({ exercises });
    if (newExercises.length > 0) {
      await this.exerciseService.bulkInsertExercises({ exercises: newExercises });
    }

    const exerciseEntities = await this.exerciseService.findExercisesByExerciseNameAndBodyPartLockMode(exercises);

    const promisedWorkoutLogs = await Promise.all(
      workoutLogs.map(async (workoutLog) => {
        const { exerciseName, bodyPart, setCount, weight, repeatCount } = workoutLog;

        const exercise = exerciseEntities.find(
          (exercise) => exercise.exerciseName === exerciseName && exercise.bodyPart === bodyPart,
        );
        if (!exercise) {
          throw new NotFoundException('Exercise not found');
        }

        return new WorkoutLog({
          setCount,
          weight,
          repeatCount,
          exercise,
          user,
          bodyPart: exercise.bodyPart,
          userNickName: user.nickName,
          exerciseName: exercise.exerciseName,
        });
      }),
    );

    const savedWorkoutLogs = await this.workoutLogRepository.bulkInsertWorkoutLogs(promisedWorkoutLogs);

    return savedWorkoutLogs.map((workoutLog) => new WorkoutLogResponseDto(workoutLog));
  }

  async getWorkoutLogsByDay(date: string, userId: number): Promise<WorkoutLogResponseDto[]> {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const workoutLogs = await this.workoutLogRepository.findWorkoutLogsByDay(date, userId);
    return workoutLogs.map((workoutLog) => {
      return new WorkoutLogResponseDto(workoutLog);
    });
  }

  @Transactional()
  async bulkUpdateWorkoutLogs(
    userId: number,
    updateWorkoutLogsRequest: UpdateWorkoutLogsRequestDto,
  ): Promise<WorkoutLogResponseDto[]> {
    const { updateWorkoutLogs } = updateWorkoutLogsRequest;
    const user = await this.userService.findOneById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const ids = updateWorkoutLogs.map((workoutLog) => {
      return workoutLog.id;
    });

    const foundWorkoutLogs = await this.workoutLogRepository.findWorkoutLogsByIdsLockMode(ids, userId);

    if (foundWorkoutLogs.length === 0) {
      throw new NotFoundException('WorkoutLogs not found');
    }

    const exercises = updateWorkoutLogs.map(({ bodyPart, exerciseName }) => ({ bodyPart, exerciseName }));
    const newExercises = await this.exerciseService.findNewExercises({ exercises });

    if (newExercises.length > 0) {
      await this.exerciseService.bulkInsertExercises({ exercises: newExercises });
    }

    const foundExercises = await this.exerciseService.findExercisesByExerciseNameAndBodyPart(exercises);
    if (exercises.length === 0) {
      throw new NotFoundException('Exercises not found');
    }

    const workoutLogMap = new Map(foundWorkoutLogs.map((log) => [log.id, log]));
    const promisedUpdateWorkoutLogs = await updateWorkoutLogsWithValidation({
      workoutLogMap,
      foundExercises,
      updateWorkoutLogs,
      user,
    });

    const UpdatedWorkoutLogs = await this.workoutLogRepository.bulkUpdateWorkoutLogs(promisedUpdateWorkoutLogs);

    return UpdatedWorkoutLogs.map((workoutLog) => {
      return new WorkoutLogResponseDto(workoutLog);
    });
  }

  @Transactional()
  async softDeleteWorkoutLogs(softDeleteRequestDto: SoftDeleteWorkoutLogRequestDto, user: User): Promise<void> {
    const { ids } = softDeleteRequestDto;
    const foundWorkoutLogs = await this.workoutLogRepository.findWorkoutLogsByIdsLockMode(ids, user.id);
    if (foundWorkoutLogs.length === 0) {
      throw new NotFoundException(`WorkoutLogs are not existed`);
    }
    await this.workoutLogRepository.softDeleteWorkoutLogs(ids, user);
  }

  async getWorkoutLogsByUser(user: User): Promise<object> {
    const result = await this.workoutLogRepository.findWorkoutLogsByUser(user);
    return GetWorkoutLogByUserResponseDto(result);
  }

  async getWorkoutLogsByYear(user: User, year: string): Promise<object> {
    const result = await this.workoutLogRepository.findWorkoutLogsByYear(user, year);
    return result;
  }

  async getWorkoutLogsByYearMonth(user: User, year: string, month: string): Promise<object> {
    const result = await this.workoutLogRepository.findWorkoutLogsByYearMonth(user, year, month);
    return result;
  }

  async getBestWorkoutLogs(): Promise<BestWorkoutLog[]> {
    return await this.workoutLogRepository.findBestWorkoutLogs();
  }

  @Transactional()
  async updateExerciseNameInWorkoutLog(updateData: UpdateExerciseNameRequestDto): Promise<any> {
    const result = await this.workoutLogRepository.updateExerciseNameInWorkoutLog(updateData);
    if (result.affected > 0) {
      return 'Exercise name updated successfully';
    }
    return 'No records updated.';
  }

  @Transactional()
  async updateUserNickName(updateUserNickNameRequestDto: UpdateUserNickNameInWorkOutLogRequestDto): Promise<any> {
    const result = await this.workoutLogRepository.updateUserNickNameInWorkoutLog(updateUserNickNameRequestDto);
    if (result.affected > 0) {
      return 'Exercise name updated successfully';
    }
    return 'No records updated.';
  }
}
