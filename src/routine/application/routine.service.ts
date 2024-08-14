import { Inject, Injectable } from '@nestjs/common';
import { ExerciseService } from '../../excercise/application/exercise.service';
import { User } from '../../user/domain/User.entity';
import { GetRoutineRequestDto } from '../dto/getRoutine.request.dto';
import { UpdateRoutinesRequestDto } from '../dto/updateRoutines.request.dto';
import { DeleteRoutineRequestDto } from '../dto/deleteRoutine.request.dto';
import { SaveRoutinesRequestDto } from '../dto/saveRoutines.request.dto';
import { ROUTINE_REPOSITORY } from '../../common/const/inject.constant';
import { RoutineRepository } from '../domain/routine.repository';

@Injectable()
export class RoutineService {
  constructor(
    readonly exerciseService: ExerciseService,

    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepository,
  ) {}

  async bulkInsertRoutines(user: User, saveRoutines: SaveRoutinesRequestDto) {
    return await this.routineRepository.bulkInsertRoutines(user, saveRoutines);
  }

  async getRoutineByName(getRoutineRequest: GetRoutineRequestDto, user: User) {
    return await this.routineRepository.getRoutineByName(getRoutineRequest, user);
  }

  async bulkUpdateRoutines(updateRoutineRequest: UpdateRoutinesRequestDto, user: User) {
    return await this.routineRepository.bulkUpdateRoutines(updateRoutineRequest, user);
  }

  async softDeleteRoutines(deleteRoutineRequestDto: DeleteRoutineRequestDto, user: User) {
    await this.routineRepository.softDeleteRoutines(deleteRoutineRequestDto, user);
  }
}
