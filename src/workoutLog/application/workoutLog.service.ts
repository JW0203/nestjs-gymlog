import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkoutLog } from '../domain/WorkoutLog.entity';
import { Repository } from 'typeorm';
import { SaveWorkoutLogRequestDto } from '../dto/SaveWorkoutLog.request.dto';
import { ExerciseService } from '../../excercise/application/exercise.service';
import { Transactional } from 'typeorm-transactional';
import { UserService } from '../../user/application/user.service';
import { reponseFormatWorkoutLog } from './functions/reponseFormatWorkoutLog';

@Injectable()
export class WorkoutLogService {
  constructor(
    @InjectRepository(WorkoutLog) private workoutLogRepository: Repository<WorkoutLog>,
    private readonly exerciseService: ExerciseService,
    private readonly userService: UserService,
  ) {}

  // @Transactional()
  // async saveWorkoutLogs(
  //   userId: number,
  //   saveWorkoutLogRequestDtoArray: SaveWorkoutLogRequestDto[],
  // ): Promise<WorkoutLog[]> {
  //   const user = await this.userService.findOneById(userId);
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }
  //   const savedWorkoutLog = [];
  //   //Todo: promise.all 로 전환
  //   for (const saveWorkoutLogRequestDto of saveWorkoutLogRequestDtoArray) {
  //     const { exerciseName, bodyPart, set, weight, repeat } = saveWorkoutLogRequestDto;
  //     const workoutLog = new WorkoutLog({ set, weight, repeat });
  //     workoutLog.user = user;
  //     let exercise = await this.exerciseService.findByExerciseNameAndBodyPart({ exerciseName, bodyPart });
  //     if (!exercise) {
  //       exercise = await this.exerciseService.saveExercise({ exerciseName, bodyPart });
  //     }
  //     workoutLog.exercise = exercise;
  //     // Todo: 반환된 값에서 유저는 이름과 아이디만
  //     const newWorkoutLog = await this.workoutLogRepository.save(workoutLog);
  //     savedWorkoutLog.push(newWorkoutLog);
  //   }
  //
  //   return savedWorkoutLog;
  // }

  @Transactional()
  async saveWorkoutLogs(userId: number, saveWorkoutLogRequestDtoArray: SaveWorkoutLogRequestDto[]): Promise<any[]> {
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
      return reponseFormatWorkoutLog(newWorkoutLog, user, exercise);
    });

    return await Promise.all(workoutLogs);
  }
}
