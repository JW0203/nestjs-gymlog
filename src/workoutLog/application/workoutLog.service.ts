import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkoutLog } from '../domain/WorkoutLog.entity';
import { In, Raw, Repository } from 'typeorm';
import { SaveWorkoutLogRequestDto } from '../dto/saveWorkoutLog.request.dto';
import { ExerciseService } from '../../excercise/application/exercise.service';
import { Transactional } from 'typeorm-transactional';
import { UserService } from '../../user/application/user.service';
import { workoutLogResponseFormat } from './functions/workoutLogResponseFormat';
import { ExerciseDataRequestDto } from '../dto/exerciseData.request.dto';
import { UpdateWorkoutLogRequestDto } from '../dto/updateWorkoutLog.request.dto';
import { SoftDeleteWorkoutLogRequestDto } from '../dto/softDeleteWorkoutLog.request.dto';
import { User } from '../../user/domain/User.entity';

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
  async saveWorkoutLogs(
    userId: number,
    exercises: ExerciseDataRequestDto[],
    saveWorkoutLogRequestDtoArray: SaveWorkoutLogRequestDto[],
  ): Promise<any> {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newExercises = await this.exerciseService.findNewExercise(exercises);
    if (newExercises) {
      await this.exerciseService.bulkInsertExercises(newExercises);
    }

    const workoutLogsPromises = saveWorkoutLogRequestDtoArray.map(async (saveWorkoutLogRequestDto) => {
      const { exerciseName, bodyPart, set, weight, repeat } = saveWorkoutLogRequestDto;

      const exercise = await this.exerciseService.findByExerciseNameAndBodyPart({
        exerciseName,
        bodyPart,
      });
      if (!exercise) {
        this.logger.log(`[not exist] ${exerciseName} and ${bodyPart}`);
        throw new BadRequestException(`${exerciseName} and ${bodyPart} are not exist`);
      }

      return new WorkoutLog({ set, weight, repeat, exercise, user });
    });

    const workoutLogs = await Promise.all(workoutLogsPromises);
    const result = await this.workoutLogRepository.insert(workoutLogs);

    const ids = result.identifiers.map((id) => id.id);
    const savedWorkoutLogs = await this.workoutLogRepository.find({
      where: { id: In(ids) },
      relations: ['user', 'exercise'],
    });
    return savedWorkoutLogs.map((workoutLog) => workoutLogResponseFormat(workoutLog));
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
      return workoutLogResponseFormat(workoutLog);
    });
  }

  @Transactional()
  async bulkUpdateWorkoutLogs(
    userId: number,
    exercises: ExerciseDataRequestDto[],
    updateWorkoutLogRequestDtoArray: UpdateWorkoutLogRequestDto[],
  ) {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const newExercises = await this.exerciseService.findNewExercise(exercises);
    if (newExercises) {
      await this.exerciseService.bulkInsertExercises(newExercises);
    }
    const updatedWorkoutLogIds: number[] = [];
    const workoutLogs = await Promise.all(
      updateWorkoutLogRequestDtoArray.map(async (updateWorkoutLog) => {
        const { id, exerciseName, bodyPart, set, weight, repeat } = updateWorkoutLog;
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
          set,
          weight,
          repeat,
          userId: user.id,
          exerciseId: exercise.id,
        };
      }),
    );
    const values = workoutLogs
      .map((log) => `(${log.id}, ${log.set}, ${log.weight}, ${log.repeat}, ${log.userId}, ${log.exerciseId})`)
      .join(', ');
    const query = `
        INSERT INTO workout_log (id, \`set\`, weight, \`repeat\`, user_id, exercise_id)
        VALUES ${values} as new
        ON DUPLICATE KEY UPDATE
          \`set\` = new.\`set\`,
          weight = new.weight,
          \`repeat\` = new.\`repeat\`,
          user_id = new.user_id,
          exercise_id = new.exercise_id;
      `;
    const result = await this.workoutLogRepository.query(query);
    const warnings = await this.workoutLogRepository.query('SHOW WARNINGS');
    const updatedWorkoutLogs = await this.workoutLogRepository.find({
      where: { id: In(updatedWorkoutLogIds) },
      relations: ['user', 'exercise'],
    });
    const workoutLogResponse = updatedWorkoutLogs.map((workoutLog) => {
      return workoutLogResponseFormat(workoutLog);
    });
    return { queryResult: result.info, warnings, updatedResults: workoutLogResponse };
  }

  async softDeleteWorkoutLogs(softDeleteRequestDto: SoftDeleteWorkoutLogRequestDto, user: User) {
    await this.workoutLogRepository
      .createQueryBuilder()
      .softDelete()
      .where({ id: In(softDeleteRequestDto.ids), user: user })
      .execute();
  }
}
