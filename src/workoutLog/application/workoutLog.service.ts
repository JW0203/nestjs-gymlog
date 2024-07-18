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
import { UpdateWorkoutLogsResponseDto } from '../dto/updateWorkoutLogs.response.dto';

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
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newExercises = await this.exerciseService.findNewExercises(saveWorkoutLogs);
    if (newExercises.length > 0) {
      await this.exerciseService.bulkInsertExercises(saveWorkoutLogs);
    }
    const exerciseEntities = await this.exerciseService.findAll(saveWorkoutLogs.exercises);

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
  async bulkUpdateWorkoutLogs(userId: number, updateWorkoutLogs: UpdateWorkoutLogsRequestDto) {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const newExercises = await this.exerciseService.findNewExercises(updateWorkoutLogs);
    if (newExercises) {
      await this.exerciseService.bulkInsertExercises({ exercises: newExercises });
    }
    const updatedWorkoutLogIds: number[] = [];
    const workoutLogs = await Promise.all(
      updateWorkoutLogs.updateWorkoutLogs.map(async (updateWorkoutLog) => {
        const { id, exerciseName, bodyPart, setCount, weight, repeatCount } = updateWorkoutLog;
        updatedWorkoutLogIds.push(id);
        const exercise = await this.exerciseService.findByExerciseNameAndBodyPart({
          exerciseName,
          bodyPart,
        });

        if (!exercise) {
          throw new BadRequestException(`Cannot find ${exerciseName} and ${bodyPart}`);
        }

        return {
          id,
          setCount,
          weight,
          repeatCount,
          userId: user.id,
          exerciseId: exercise.id,
        };
      }),
    );
    const values = workoutLogs
      .map((log) => `(${log.id}, ${log.setCount}, ${log.weight}, ${log.repeatCount}, ${log.userId}, ${log.exerciseId})`)
      .join(', ');
    const query = `
        INSERT INTO workout_log (id, setCount, weight, repeatCount, user_id, exercise_id)
        VALUES ${values} as new
        ON DUPLICATE KEY UPDATE
          setCount = new.setCount,
          weight = new.weight,
          repeatCount = new.repeatCount,
          user_id = new.user_id,
          exercise_id = new.exercise_id;
      `;
    const result = await this.workoutLogRepository.query(query);
    const warnings = await this.workoutLogRepository.query('SHOW WARNINGS');
    const updatedWorkoutLogs = await this.workoutLogRepository.find({
      where: { id: In(updatedWorkoutLogIds) },
      relations: ['user', 'exercise'],
    });
    const updatedResults = updatedWorkoutLogs.map((workoutLog) => {
      return new WorkoutLogResponseDto(workoutLog);
    });
    return new UpdateWorkoutLogsResponseDto({ queryResult: result.info, warnings, updatedResults });
  }

  async softDeleteWorkoutLogs(softDeleteRequestDto: SoftDeleteWorkoutLogRequestDto, user: User) {
    await this.workoutLogRepository
      .createQueryBuilder()
      .softDelete()
      .where({ id: In(softDeleteRequestDto.ids), user: user })
      .execute();
  }
}
