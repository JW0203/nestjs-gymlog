import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkoutLog } from '../domain/WorkoutLog.entity';
import { DataSource, In, Raw, Repository } from 'typeorm';
import { ExerciseService } from '../../excercise/application/exercise.service';
import { IsolationLevel, Transactional } from 'typeorm-transactional';
import { UserService } from '../../user/application/user.service';
import { SoftDeleteWorkoutLogRequestDto } from '../dto/softDeleteWorkoutLog.request.dto';
import { User } from '../../user/domain/User.entity';
import { SaveWorkoutLogsRequestDto } from '../dto/saveWorkoutLogs.request.dto';
import { UpdateWorkoutLogsRequestDto } from '../dto/updateWorkoutLogs.request.dto';
import { WorkoutLogResponseDto } from '../dto/workoutLog.response.dto';
import { UpdateWorkoutLogsResponseDto } from '../dto/updateWorkoutLogs.response.dto';

@Injectable()
export class WorkoutLogService {
  private readonly logger = new Logger(WorkoutLogService.name);
  constructor(
    private dataSource: DataSource,
    @InjectRepository(WorkoutLog)
    private workoutLogRepository: Repository<WorkoutLog>,
    private readonly exerciseService: ExerciseService,
    private readonly userService: UserService,
  ) {}

  async bulkInsertWorkoutLogs(userId: number, saveWorkoutLogs: SaveWorkoutLogsRequestDto): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(IsolationLevel.SERIALIZABLE);
    try {
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const newExercises = await this.exerciseService.findNewExercises(saveWorkoutLogs);
      if (newExercises.length > 0) {
        await this.exerciseService.bulkInsertExercises({ exercises: newExercises });
      }

      const exerciseEntities = await this.exerciseService.findAll(saveWorkoutLogs.exercises);

      this.logger.log('Make data for bulk insert');
      const workoutLogs = await Promise.all(
        saveWorkoutLogs.workoutLogs.map(async (workoutLog) => {
          const { exerciseName, bodyPart, ...workoutLogData } = workoutLog;

          const exercise = exerciseEntities.find(
            (exercise) => exercise.exerciseName === exerciseName && exercise.bodyPart === bodyPart,
          );
          if (!exercise) {
            throw new NotFoundException('Exercise not found');
          }
          return new WorkoutLog({
            setCount: workoutLogData.setCount,
            weight: workoutLogData.weight,
            repeatCount: workoutLogData.repeatCount,
            exercise,
            user,
          });
        }),
      );

      const result = await this.workoutLogRepository.insert(workoutLogs);
      const ids = result.identifiers.map((id) => id.id);

      const savedWorkoutLogs = await this.workoutLogRepository.find({
        where: { id: In(ids) },
        relations: ['user', 'exercise'],
      });
      await queryRunner.commitTransaction();
      return savedWorkoutLogs.map((workoutLog) => new WorkoutLogResponseDto(workoutLog));
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
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
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const ids = updateWorkoutLogsRequest.updateWorkoutLogs.map((workoutLog) => {
      return workoutLog.id;
    });

    const foundWorkoutLogs = await this.workoutLogRepository.find({
      where: { id: In(ids) },
    });
    if (!foundWorkoutLogs) {
      throw new BadRequestException('WorkoutLogs not found');
    }

    const newExercises = await this.exerciseService.findNewExercises(updateWorkoutLogsRequest);
    if (newExercises.length > 0) {
      await this.exerciseService.bulkInsertExercises({ exercises: newExercises });
    }

    const exercises = await this.exerciseService.findAll(updateWorkoutLogsRequest.exercises);
    if (exercises.length === 0) {
      throw new NotFoundException('Exercises not found');
    }
    const updatedWorkoutLogIds: number[] = [];
    const promiseUpdateWorkoutLogs = updateWorkoutLogsRequest.updateWorkoutLogs.map(async (workoutLog) => {
      const { id, setCount, repeatCount, weight, exerciseName, bodyPart } = workoutLog;
      updatedWorkoutLogIds.push(id);
      const exercise = exercises.find(
        (exercise) => exercise.exerciseName === exerciseName && exercise.bodyPart === bodyPart,
      );
      if (!exercise) {
        throw new BadRequestException(`Cannot find ${exerciseName} and ${bodyPart}`);
      }

      const foundWorkoutLog = await this.workoutLogRepository.findOneBy({ id: workoutLog.id });
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
    });
    await Promise.all(promiseUpdateWorkoutLogs);
    const foundUpdatedWorkoutLogs = await this.workoutLogRepository.find({
      where: { id: In(updatedWorkoutLogIds) },
      relations: ['user', 'exercise'],
    });

    return foundUpdatedWorkoutLogs.map((workoutLog) => {
      return new WorkoutLogResponseDto(workoutLog);
    });
  }

  async softDeleteWorkoutLogs(softDeleteRequestDto: SoftDeleteWorkoutLogRequestDto, user: User) {
    await this.workoutLogRepository
      .createQueryBuilder()
      .softDelete()
      .where({ id: In(softDeleteRequestDto.ids), user: user })
      .execute();
  }
}
