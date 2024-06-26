import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Routine } from '../domain/Routine.entity';
import { Repository } from 'typeorm';
import { SaveRoutineRequestDto } from '../dto/saveRoutine.request.dto';
import { ExerciseService } from '../../excercise/application/exercise.service';
import { User } from '../../user/domain/User.entity';
import { RoutineToExerciseService } from '../../routineToExercise/application/routineToExercise.service';
import { GetRoutineRequestDto } from '../dto/getRoutine.request.dto';
import { PatchRoutineRequestDto } from '../dto/patchRoutine.request.dto';
import { DeleteRoutineRequestDto } from '../dto/deleteRoutine.request.dto';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class RoutineService {
  private readonly logger = new Logger(RoutineService.name);
  constructor(
    @InjectRepository(Routine) private readonly routineRepository: Repository<Routine>,
    readonly exerciseService: ExerciseService,
    readonly routineToExerciseService: RoutineToExerciseService,
  ) {}

  @Transactional()
  async saveRoutine(user: User, SaveRoutineRequestArray: SaveRoutineRequestDto[]) {
    const savedRoutine = [];
    for (const SaveRoutineRequest of SaveRoutineRequestArray) {
      const { routineName, exerciseName, bodyPart } = SaveRoutineRequest;
      const newRoutine = await this.routineRepository.save({ name: routineName, user });

      let exercise = await this.exerciseService.findByExerciseNameAndBodyPart({ exerciseName, bodyPart });
      if (!exercise) {
        exercise = await this.exerciseService.saveExercise({ exerciseName, bodyPart });
      }

      const routineToExercise = await this.routineToExerciseService.saveRelation({ exercise, routine: newRoutine });
      savedRoutine.push(routineToExercise);
    }
    return savedRoutine;
  }

  async getRoutineByName(getRoutineRequest: GetRoutineRequestDto, user: User) {
    const { name } = getRoutineRequest;
    const routines = await this.routineRepository
      .createQueryBuilder('routine')
      .leftJoinAndSelect('routine.routineToExercises', 'routineToExercises')
      .leftJoinAndSelect('routineToExercises.exercise', 'exercise')
      .innerJoin('routine.user', 'user')
      .select([
        'routine.id',
        'routine.name',
        'routineToExercises.id',
        'exercise.id',
        'exercise.exerciseName',
        'exercise.bodyPart',
      ])
      .where('routine.name = :name AND user.id = :userId', { name, userId: user.id })
      .getMany();

    if (!Array.isArray(routines) || routines.length === 0) {
      this.logger.error(`Routine using name:'${name}' and userId:${user.id} does not found`);
      throw new BadRequestException(`Routine using name:'${name}' and userId:${user.id} does not found`);
    }
    this.logger.log(`found routines using ${name}`);
    return routines;
  }

  @Transactional()
  async patchRoutine(patchRoutineRequestDto: PatchRoutineRequestDto, user: User) {
    const { routineName, dataArray } = patchRoutineRequestDto;
    const patchResults = [];

    for (const data of dataArray) {
      const { routineId, exerciseName, bodyPart, routineToExerciseId } = data;
      let exercise = await this.exerciseService.findByExerciseNameAndBodyPart({ exerciseName, bodyPart });
      if (!exercise) {
        exercise = await this.exerciseService.saveExercise({ exerciseName, bodyPart });
      }
      const routineUpdate = await this.routineRepository.update({ id: routineId, user }, { name: routineName });
      const routineUpdateResult = routineUpdate.affected ? 'updated' : false;
      if (routineUpdateResult === false) {
        throw new BadRequestException(`updating routineRepository is failed`);
      }
      const routine = await this.routineRepository.findOne({ where: { id: routineId } });
      if (!routine) {
        throw new BadRequestException(`routineId ${routineId} not found`);
      }
      const routineToExerciseUpdateResult = await this.routineToExerciseService.update(routineToExerciseId, {
        exercise,
        routine,
      });
      patchResults.push({ routineId, routineUpdateResult, routineToExerciseId, routineToExerciseUpdateResult });
    }
    return patchResults;
  }

  @Transactional()
  async softDeleteRoutine(deleteRoutineRequestDto: DeleteRoutineRequestDto, user: User) {
    const { routineName } = deleteRoutineRequestDto;

    const routines = await this.routineRepository.find({
      where: { name: routineName, user: { id: user.id } },
      relations: { routineToExercises: { exercise: true } },
    });
    if (routines.length === 0) {
      throw new BadRequestException(`Routines not found`);
    }
    const routineToExercisesIds = routines.map((routine) => {
      const routineId = routine.id;
      const routineToExercisesId = routine.routineToExercises.map((routineToExercises) => routineToExercises.id);
      return { routineId, routineToExercisesId: routineToExercisesId[0] };
    });

    for (const { routineId, routineToExercisesId } of routineToExercisesIds) {
      await this.routineToExerciseService.softDelete(routineToExercisesId);
      await this.routineRepository.softDelete(routineId);
    }
  }
}
