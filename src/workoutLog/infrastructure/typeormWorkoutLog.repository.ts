import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkoutLog } from '../domain/WorkoutLog.entity';
import { Between, In, Repository } from 'typeorm';
import { User } from '../../user/domain/User.entity';
import { WorkoutLogRepository } from '../domain/workoutLog.repository';
import { FindWorkoutLogsByYearResponseDto } from '../dto/findWorkoutLogsByYear.response.dto';
import { BestWorkoutLog } from '../dto/findBestWorkoutLogs.response.dto';
import { FindWorkoutLogsByYearMonthResponseDto } from '../dto/findWorkoutLogsByYearMonth.response.dto';
import { UpdateExerciseNameRequestDto } from '../../exercise/dto/updateExerciseName.request.dto';
import { UpdateUserNickNameInWorkOutLogRequestDto } from '../dto/updateUserNickNameInWorkoutLog.request.dto';

@Injectable()
export class TypeormWorkoutLogRepository implements WorkoutLogRepository {
  constructor(
    @InjectRepository(WorkoutLog)
    private workoutLogRepository: Repository<WorkoutLog>,
  ) {}

  async bulkInsertWorkoutLogs(newWorkoutLogs: WorkoutLog[]): Promise<WorkoutLog[]> {
    return await this.workoutLogRepository.save(newWorkoutLogs);
  }

  async bulkUpdateWorkoutLogs(UpdateWorkoutLogs: WorkoutLog[]): Promise<WorkoutLog[]> {
    return await this.workoutLogRepository.save(UpdateWorkoutLogs);
  }

  async findWorkoutLogsByIdsLockMode(ids: number[], userId: number): Promise<WorkoutLog[]> {
    return await this.workoutLogRepository.find({
      where: { id: In(ids), user: { id: userId } },
      lock: { mode: 'pessimistic_write' },
    });
  }
  async findWorkoutLogsByDay(date: string, userId: number): Promise<WorkoutLog[]> {
    const [year, month, day] = date.split('-').map(Number);

    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

    return await this.workoutLogRepository.find({
      where: {
        createdAt: Between(startOfDay, endOfDay),
        user: { id: userId },
      },
      relations: ['exercise', 'user'],
    });
  }

  async softDeleteWorkoutLogs(ids: number[], user: User): Promise<void> {
    await this.workoutLogRepository.softDelete({ id: In(ids), user: { id: user.id } });
  }

  async findWorkoutLogsByUser(user: User): Promise<WorkoutLog[]> {
    return await this.workoutLogRepository.find({
      where: { user: { id: user.id } },
      relations: ['exercise'],
    });
  }

  async updateExerciseNameInWorkoutLog(updateData: UpdateExerciseNameRequestDto): Promise<any> {
    const { originExerciseName, newExerciseName } = updateData;
    return await this.workoutLogRepository
      .createQueryBuilder('wl')
      .update()
      .set({ exerciseName: newExerciseName })
      .where({ exerciseName: originExerciseName })
      .execute();
  }

  async updateUserNickNameInWorkoutLog(
    updateUserNickNameRequestDto: UpdateUserNickNameInWorkOutLogRequestDto,
  ): Promise<any> {
    const { nickName, userId } = updateUserNickNameRequestDto;
    return await this.workoutLogRepository
      .createQueryBuilder()
      .update()
      .set({ userNickName: nickName })
      .where({ user: { id: userId } })
      .execute();
  }

  async findWorkoutLogsByYear(user: User, year: string): Promise<FindWorkoutLogsByYearResponseDto[]> {
    return await this.workoutLogRepository
      .createQueryBuilder('workoutLog')
      .select('user.id', 'user_id')
      .select('exercise.exercise_name', 'exercise_name')
      .addSelect('COUNT(workoutLog.id)', 'exercise_count')
      .addSelect('MAX(workoutLog.weight)', 'max_weight')
      .addSelect('EXTRACT(YEAR FROM workoutLog.created_at)', 'year')
      .leftJoin('exercise', 'exercise', 'exercise.id = workoutLog.exercise_id')
      .leftJoin('user', 'user', 'user.id = workoutLog.user_id')
      .where('workoutLog.deleted_at IS NULL')
      .andWhere('EXTRACT(YEAR FROM workoutLog.created_at) = :year', { year })
      .andWhere('user.id = :userId', { userId: user.id })
      .groupBy('exercise.exercise_name')
      .addGroupBy('EXTRACT(YEAR FROM workoutLog.created_at)')
      .orderBy('exercise.exercise_name', 'DESC')
      .getRawMany();
  }

  async findWorkoutLogsByYearMonth(
    user: User,
    year: string,
    month: string,
  ): Promise<FindWorkoutLogsByYearMonthResponseDto[]> {
    return await this.workoutLogRepository
      .createQueryBuilder('workoutLog')
      .select('user.id', 'user_id')
      .addSelect('exercise.bodyPart', 'body_part')
      .addSelect('exercise.exercise_name', 'exercise_name')
      .addSelect('MAX(workoutLog.weight)', 'max_weight')
      .addSelect('COUNT(workoutLog.id)', 'exercise_count')
      .addSelect('EXTRACT(YEAR FROM workoutLog.created_at)', 'year')
      .addSelect('EXTRACT(MONTH FROM workoutLog.created_at)', 'month')
      .leftJoin('workoutLog.exercise', 'exercise')
      .leftJoin('workoutLog.user', 'user')
      .where('workoutLog.deleted_at IS NULL')
      .andWhere('EXTRACT(YEAR FROM workoutLog.created_at) = :year', { year })
      .andWhere('EXTRACT(MONTH FROM workoutLog.created_at) = :month', { month })
      .andWhere('user.id = :userId', { userId: user.id })
      .groupBy('exercise.exercise_name')
      .addGroupBy('exercise.bodyPart')
      .addGroupBy('EXTRACT(YEAR FROM workoutLog.created_at)')
      .addGroupBy('EXTRACT(MONTH FROM workoutLog.created_at)')
      .orderBy('exercise.bodyPart', 'DESC')
      .getRawMany();
  }
  /*

  // 원본 sql
  async findBestWorkoutLogs(): Promise<BestWorkoutLog[]> {
    return await this.workoutLogRepository.query(
      `
      WITH max_weight_logs AS (
      SELECT wl.exercise_id, wl.user_id, wl.weight, MIN(wl.created_at) AS created_at
      FROM workout_log wl
      JOIN (
          SELECT exercise_id, MAX(weight) AS max_weight
          FROM workout_log
          GROUP BY exercise_id
      ) max_wl ON wl.exercise_id = max_wl.exercise_id AND wl.weight = max_wl.max_weight
      GROUP BY wl.exercise_id, wl.user_id, wl.weight
      )
      SELECT
      ex.body_part AS 운동_부위,
      ex.exercise_name AS 운동_이름,
      SUBSTRING(u.email, 1, LOCATE('@', u.email) - 1) AS 유저아이디,
      mwl.weight AS 무게
      FROM max_weight_logs mwl
      JOIN exercise ex ON mwl.exercise_id = ex.id
      JOIN user u ON mwl.user_id = u.id;
    `,
    );
  }
*/

  /*
  // denormalize 하기 전
  async findBestWorkoutLogs(): Promise<BestWorkoutLog[]> {
    const maxWeightSubQuery = this.workoutLogRepository
      .createQueryBuilder('wl')
      .select('wl.exercise_id', 'exercise_id')
      .addSelect('MAX(wl.weight)', 'max_weight')
      .groupBy('wl.exercise_id');

    const earliestMaxWeightSubQuery = this.workoutLogRepository
      .createQueryBuilder('mw')
      .select('mw.exercise_id', 'exercise_id')
      .addSelect('mw.weight', 'weight')
      .addSelect('MIN(mw.created_at)', 'earliest_created_at')
      .addSelect('e.body_part', 'body_part') // body_part 추가
      .addSelect('SUBSTRING(u.email, 1, POSITION("@" IN u.email) - 1)', 'user_id') // 이메일에서 아이디 부분만 추출
      .innerJoin(
        `(${maxWeightSubQuery.getQuery()})`,
        'maxWeight',
        'mw.exercise_id = maxWeight.exercise_id AND mw.weight = maxWeight.max_weight',
      )
      .innerJoin('mw.exercise', 'e')
      .innerJoin('mw.user', 'u')
      .groupBy('mw.exercise_id')
      .addGroupBy('mw.weight')
      .addGroupBy('e.body_part')
      .addGroupBy('u.email');

    const parameters = {
      ...maxWeightSubQuery.getParameters(),
      ...earliestMaxWeightSubQuery.getParameters(),
    };

    const result = await this.workoutLogRepository.manager
      .createQueryBuilder()
      .select('sub.body_part', 'body_part')
      .addSelect('e.exercise_name', 'exercise_name')
      .addSelect('sub.weight', 'final_weight')
      // .addSelect('sub.earliest_created_at', 'created_at')
      .addSelect('sub.user_id', 'user_email_id')
      .from(`(${earliestMaxWeightSubQuery.getQuery()})`, 'sub')
      .innerJoin('exercise', 'e', 'sub.exercise_id = e.id')
      .setParameters(parameters)
      .distinct(true)
      .getRawMany();

    return result;
  }
 */

  async findBestWorkoutLogs(): Promise<BestWorkoutLog[]> {
    return await this.workoutLogRepository
      .createQueryBuilder('wl1')
      .select('wl1.body_part', 'body_part')
      .addSelect('wl1.exercise_name', 'exercise_name')
      .addSelect('wl1.user_nick_name', 'user_nick_name')
      .addSelect('wl1.weight', 'weight')
      .where((qb) => {
        // 각 운동별 최대 무게와 일치하는지 확인
        const subQuery = qb
          .subQuery()
          .select('wl2.body_part', 'body_part')
          .addSelect('wl2.exercise_name', 'exercise_name')
          .addSelect('MAX(wl2.weight)', 'max_weight')
          .from(WorkoutLog, 'wl2')
          .groupBy('wl2.body_part')
          .addGroupBy('wl2.exercise_name');
        return `(wl1.body_part, wl1.exercise_name, wl1.weight) IN ${subQuery.getQuery()}`;
      })
      .andWhere((qb) => {
        // 같은 무게 중에서 더 일찍 달성한 기록이 있는지 확인
        const subQuery = qb
          .subQuery()
          .select('1')
          .from(WorkoutLog, 'wl3')
          .where('wl3.body_part = wl1.body_part')
          .andWhere('wl3.exercise_name = wl1.exercise_name')
          .andWhere('wl3.weight = wl1.weight')
          .andWhere('wl3.created_at < wl1.created_at');
        return 'NOT EXISTS ' + subQuery.getQuery();
      })
      .orderBy('wl1.body_part')
      .addOrderBy('wl1.exercise_name')
      .getRawMany();
  }
}
