import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkoutLog } from '../domain/WorkoutLog.entity';
import { Between, Raw, Repository } from 'typeorm';
import { SaveWorkoutLogRequestDto } from '../dto/SaveWorkoutLog.request.dto';
import { ExerciseService } from '../../excercise/application/exercise.service';
import { Transactional } from 'typeorm-transactional';
import { UserService } from '../../user/application/user.service';
import { workoutLogResponseFormat } from './functions/workoutLogResponseFormat';

@Injectable()
export class WorkoutLogService {
  private readonly logger = new Logger(WorkoutLogService.name);
  constructor(
    @InjectRepository(WorkoutLog) private workoutLogRepository: Repository<WorkoutLog>,
    private readonly exerciseService: ExerciseService,
    private readonly userService: UserService,
  ) {}

  @Transactional()
  async saveWorkoutLogs(userId: number, saveWorkoutLogRequestDtoArray: SaveWorkoutLogRequestDto[]): Promise<any[]> {
    this.logger.log('start saveWorkoutLogs');
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const workoutLogs = saveWorkoutLogRequestDtoArray.map(async (saveWorkoutLogRequestDto) => {
      const { exerciseName, bodyPart, set, weight, repeat } = saveWorkoutLogRequestDto;
      const workoutLog = new WorkoutLog({ set, weight, repeat });
      workoutLog.user = user;

      let exercise = await this.exerciseService.findByExerciseNameAndBodyPart({ exerciseName, bodyPart });
      if (!exercise) {
        exercise = await this.exerciseService.saveExercise({ exerciseName, bodyPart });
      }
      workoutLog.exercise = exercise;

      const newWorkoutLog = await this.workoutLogRepository.save(workoutLog);
      return workoutLogResponseFormat(newWorkoutLog, user, exercise);
    });
    this.logger.log('finish saveWorkoutLogs');
    return await Promise.all(workoutLogs);
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
      return workoutLogResponseFormat(workoutLog, workoutLog.user, workoutLog.exercise);
    });
  }
}
