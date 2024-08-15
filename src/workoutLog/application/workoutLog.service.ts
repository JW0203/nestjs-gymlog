import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkoutLog } from '../domain/WorkoutLog.entity';
import { In, Raw, Repository } from 'typeorm';
import { ExerciseService } from '../../excercise/application/exercise.service';
import { Transactional } from 'typeorm-transactional';
import { UserService } from '../../user/application/user.service';
import { SoftDeleteWorkoutLogRequestDto } from '../dto/softDeleteWorkoutLog.request.dto';
import { User } from '../../user/domain/User.entity';
import { SaveWorkoutLogsRequestDto } from '../dto/saveWorkoutLogs.request.dto';
import { UpdateWorkoutLogsRequestDto } from '../dto/updateWorkoutLogs.request.dto';
import { WorkoutLogResponseDto } from '../dto/workoutLog.response.dto';
import { GetWorkoutLogByUserResponseDto } from '../dto/getWorkoutLogByUser.response.dto';

@Injectable()
export class WorkoutLogService {
  private readonly logger = new Logger(WorkoutLogService.name);
  constructor(
    @InjectRepository(WorkoutLog)
    private workoutLogRepository: Repository<WorkoutLog>,
    private readonly exerciseService: ExerciseService,
    private readonly userService: UserService,
  ) {}

  @Transactional()
  async bulkInsertWorkoutLogs(userId: number, saveWorkoutLogs: SaveWorkoutLogsRequestDto): Promise<any> {
    const { exercises, workoutLogs } = saveWorkoutLogs;
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const newExercises = await this.exerciseService.findNewExercises(saveWorkoutLogs);
    if (newExercises.length > 0) {
      await this.exerciseService.bulkInsertExercises({ exercises: newExercises });
    }

    const exerciseEntities = await this.exerciseService.findExercisesByExerciseNameAndBodyPart({
      exercises,
      lock: true,
    });

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
        });
      }),
    );

    const insertedResults = await this.workoutLogRepository.insert(promisedWorkoutLogs);
    const ids = insertedResults.identifiers.map((result) => result.id);

    const savedWorkoutLogs = await this.workoutLogRepository.find({
      where: { id: In(ids) },
      relations: ['user', 'exercise'],
    });
    return savedWorkoutLogs.map((workoutLog) => new WorkoutLogResponseDto(workoutLog));
  }

  async getWorkoutLogsByDay(date: string, userId: number) {
    this.logger.log('Start getWorkoutLogsByDay');
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const workoutLogs = await this.workoutLogRepository.find({
      where: {
        createdAt: Raw((alias) => `Date(${alias}) = :date`, { date }),
        user: { id: userId },
      },
      relations: { exercise: true, user: true },
    });
    this.logger.log('Finish getWorkoutLogsByDay');
    return workoutLogs.map((workoutLog) => {
      return new WorkoutLogResponseDto(workoutLog);
    });
  }

  @Transactional()
  async bulkUpdateWorkoutLogs(userId: number, updateWorkoutLogsRequest: UpdateWorkoutLogsRequestDto) {
    const { updateWorkoutLogs, exercises } = updateWorkoutLogsRequest;
    const user = await this.userService.findOneById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const ids = updateWorkoutLogs.map((workoutLog) => {
      return workoutLog.id;
    });

    const foundWorkoutLogs = await this.workoutLogRepository.find({
      where: { id: In(ids), user: { id: userId } },
      relations: ['user'],
      lock: { mode: 'pessimistic_write' },
    });

    if (foundWorkoutLogs.length === 0) {
      throw new BadRequestException('WorkoutLogs not found');
    }

    const newExercises = await this.exerciseService.findNewExercises(updateWorkoutLogsRequest);
    if (newExercises.length > 0) {
      await this.exerciseService.bulkInsertExercises({ exercises: newExercises });
    }

    const foundExercises = await this.exerciseService.findExercisesByExerciseNameAndBodyPart({
      exercises,
      lock: false,
    });
    if (exercises.length === 0) {
      throw new NotFoundException('Exercises not found');
    }
    const updatedWorkoutLogIds: number[] = [];
    const promiseUpdateWorkoutLogs = updateWorkoutLogs.map(async (workoutLog) => {
      const { id, setCount, repeatCount, weight, exerciseName, bodyPart } = workoutLog;
      updatedWorkoutLogIds.push(id);
      const exercise = foundExercises.find(
        (exercise) => exercise.exerciseName === exerciseName && exercise.bodyPart === bodyPart,
      );
      if (!exercise) {
        throw new BadRequestException(`Cannot find ${exerciseName} and ${bodyPart}`);
      }

      const foundWorkoutLog = await this.workoutLogRepository.findOne({
        where: { id: workoutLog.id },
        relations: ['user', 'exercise'],
      });
      if (!foundWorkoutLog) {
        throw 'workoutLogs not found';
      }
      foundWorkoutLog.update({
        setCount,
        weight,
        repeatCount,
        user,
        exercise,
      });
      return foundWorkoutLog;
    });

    const promisedUpdateWorkoutLogs = await Promise.all(promiseUpdateWorkoutLogs);
    await this.workoutLogRepository.save(promisedUpdateWorkoutLogs);
    const foundUpdatedWorkoutLogs = await this.workoutLogRepository.find({
      where: { id: In(updatedWorkoutLogIds) },
      relations: ['user', 'exercise'],
    });

    return foundUpdatedWorkoutLogs.map((workoutLog) => {
      return new WorkoutLogResponseDto(workoutLog);
    });
  }

  @Transactional()
  async softDeleteWorkoutLogs(softDeleteRequestDto: SoftDeleteWorkoutLogRequestDto, user: User) {
    const foundWorkoutLogs = await this.workoutLogRepository.find({
      where: { id: In(softDeleteRequestDto.ids), user: { id: user.id } },
      relations: ['user', 'exercise'],
    });
    if (foundWorkoutLogs.length === 0) {
      throw new BadRequestException(`WorkoutLogs are not existed`);
    }
    await this.workoutLogRepository.softDelete({ id: In(softDeleteRequestDto.ids), user: { id: user.id } });
  }

  async getWorkoutLogByUser(user: User) {
    const result = await this.workoutLogRepository.find({
      where: { user: { id: user.id } },
      relations: ['exercise'],
    });
    return GetWorkoutLogByUserResponseDto(result);
  }
}
