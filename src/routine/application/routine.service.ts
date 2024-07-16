import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Routine } from '../domain/Routine.entity';
import { In, Repository } from 'typeorm';
import { ExerciseService } from '../../excercise/application/exercise.service';
import { User } from '../../user/domain/User.entity';
import { GetRoutineRequestDto } from '../dto/getRoutine.request.dto';
import { UpdateRoutineRequestDto } from '../dto/updateRoutine.request.dto';
import { DeleteRoutineRequestDto } from '../dto/deleteRoutine.request.dto';
import { Transactional } from 'typeorm-transactional';
import { SaveAllRoutineRequestDto } from '../dto/saveAllRoutine.request.dto';
import { RoutineResponseFromt } from './functions/RoutineResponse.fromat';

@Injectable()
export class RoutineService {
  private readonly logger = new Logger(RoutineService.name);
  constructor(
    @InjectRepository(Routine) private readonly routineRepository: Repository<Routine>,
    readonly exerciseService: ExerciseService,
  ) {}

  @Transactional()
  async bulkInsertRoutines(user: User, saveRoutines: SaveAllRoutineRequestDto) {
    const newExercises = await this.exerciseService.findNewExercises(saveRoutines);
    if (newExercises.length > 0) {
      console.log(newExercises);
      await this.exerciseService.bulkInsertExercises({ exercises: newExercises });
    }

    const promiseRoutine = await Promise.all(
      saveRoutines.routines.map(async (routine) => {
        const { routineName, exerciseName, bodyPart } = routine;

        const exercise = await this.exerciseService.findByExerciseNameAndBodyPart({ exerciseName, bodyPart });
        if (!exercise) {
          throw new NotFoundException(
            `exercise (${exerciseName}, ${bodyPart}) not found. : ${JSON.stringify(exercise)} `,
          );
        }
        return new Routine({ name: routineName, user: user, exercise: exercise });
      }),
    );

    const savedRoutines = await this.routineRepository.insert(promiseRoutine);
    const ids: number[] = savedRoutines.identifiers.map((routine) => {
      return routine.id;
    });
    const foundRoutines = await this.routineRepository.find({
      where: { id: In(ids) },
      relations: ['user', 'exercise'],
    });
    // Todo: 선택된 반환 값을 보여주기 위한 dto 만들기
    return foundRoutines.map((routine) => RoutineResponseFromt(routine));
  }

  // Todo : 루틴을 하나만 저장하는 것은 말이 안된다고 생각하고 삭제, 하지만 한번 더 고려
  // @Transactional()
  // async saveRoutine(user: User, SaveRoutineRequest: SaveRoutineRequestDto) {
  //   const { routineName, exerciseName, bodyPart } = SaveRoutineRequest;
  //   const exercise = await this.exerciseService.findByExerciseNameAndBodyPart({ exerciseName, bodyPart });
  //   if (!exercise) {
  //     throw new NotFoundException(`exercise not found. : ${JSON.stringify(exercise)} `);
  //   }
  //   const newRoutine = await this.routineRepository.save({ name: routineName, user });
  //   return await this.routineRepository.findOne({
  //     where: { id: newRoutine.id },
  //     relations: ['user', 'exercise'],
  //   });
  // }

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
    // Todo: bulk delete 구현
    const { routineName } = deleteRoutineRequestDto;
    console.log(user.id);
    const routines = await this.routineRepository.find({
      where: { name: routineName },
      relations: { exercise: true },
    });
    if (routines.length === 0) {
      throw new BadRequestException(`Routines not found`);
    }
    const routineToExercisesIds = routines.map((routine) => {
      const routineId = routine.id;
      return { routineId };
    });

    for (const { routineId } of routineToExercisesIds) {
      await this.routineRepository.softDelete(routineId);
    }
  }
}
