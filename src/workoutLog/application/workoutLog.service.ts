import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkoutLog } from '../domain/WorkoutLog.entity';
import { Between, In, Raw, Repository } from 'typeorm';
import { SaveWorkoutLogRequestDto } from '../dto/SaveWorkoutLog.request.dto';
import { ExerciseService } from '../../excercise/application/exercise.service';
import { Transactional } from 'typeorm-transactional';
import { UserService } from '../../user/application/user.service';
import { workoutLogResponseFormat } from './functions/workoutLogResponseFormat';
import { BodyPart } from '../../excercise/domain/bodyPart.enum';
import { ExerciseDataRequestDto } from '../dto/exerciseData.request.dto';
import { User } from '../../user/domain/User.entity';

@Injectable()
export class WorkoutLogService {
  private readonly logger = new Logger(WorkoutLogService.name);
  constructor(
    @InjectRepository(WorkoutLog) private workoutLogRepository: Repository<WorkoutLog>,
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
      await this.exerciseService.saveExercises(newExercises);
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

      const workoutLog = new WorkoutLog({ set, weight, repeat });
      workoutLog.exercise = exercise;
      workoutLog.user = user;
      return workoutLog;
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
}
