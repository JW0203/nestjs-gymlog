import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Routine } from '../domain/Routine.entity';
import { In, Repository } from 'typeorm';
import { ExerciseService } from '../../excercise/application/exercise.service';
import { User } from '../../user/domain/User.entity';
import { GetRoutineRequestDto } from '../dto/getRoutine.request.dto';
import { UpdateRoutinesRequestDto } from '../dto/updateRoutines.request.dto';
import { DeleteRoutineRequestDto } from '../dto/deleteRoutine.request.dto';
import { Transactional } from 'typeorm-transactional';
import { SaveRoutinesRequestDto } from '../dto/saveRoutines.request.dto';
import { RoutineResponseDto } from '../dto/routine.response.dto';

@Injectable()
export class RoutineService {
  private readonly logger = new Logger(RoutineService.name);
  constructor(
    @InjectRepository(Routine) private readonly routineRepository: Repository<Routine>,
    readonly exerciseService: ExerciseService,
  ) {}

  @Transactional()
  async bulkInsertRoutines(user: User, saveRoutines: SaveRoutinesRequestDto) {
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
    return foundRoutines.map((routine) => new RoutineResponseDto(routine));
  }

  async getRoutineByName(getRoutineRequest: GetRoutineRequestDto, user: User) {
    const { name } = getRoutineRequest;
    const foundRoutines = await this.routineRepository.find({
      where: { name, user: { id: user.id } },
      relations: ['user', 'exercise'],
    });
    return foundRoutines.map((routine) => new RoutineResponseDto(routine));
  }

  @Transactional()
  async bulkUpdateRoutines(updateRoutineRequest: UpdateRoutinesRequestDto, user: User) {
    const NewExercises = await this.exerciseService.findNewExercises(updateRoutineRequest);
    if (NewExercises.length > 0) {
      await this.exerciseService.bulkInsertExercises({ exercises: NewExercises });
    }
    // Todo: 저장하기 전에 중복 체크 필요....
    const promiseUpdatedIds = await Promise.all(
      updateRoutineRequest.updateData.map(async (updateRoutine) => {
        const { routineName, id, exerciseName, bodyPart } = updateRoutine;
        console.log(routineName);
        const exercise = await this.exerciseService.findByExerciseNameAndBodyPart({ exerciseName, bodyPart });
        if (!exercise) {
          throw new NotFoundException(`${exerciseName}, ${bodyPart} can not find`);
        }

        await this.routineRepository.update(id, { name: routineName, exercise, user });
        return id;
      }),
    );
    const foundRoutines = await this.routineRepository.find({
      where: { id: In(promiseUpdatedIds) },
      relations: ['exercise', 'user'],
    });
    return foundRoutines.map((routine) => new RoutineResponseDto(routine));
  }

  @Transactional()
  async softDeleteRoutines(deleteRoutineRequestDto: DeleteRoutineRequestDto, user: User) {
    const { routineName } = deleteRoutineRequestDto;
    const routines = await this.routineRepository.find({
      where: { name: routineName, user: { id: user.id } },
      relations: ['user', 'exercise'],
    });
    if (routines.length === 0) {
      throw new BadRequestException(`Routines not found`);
    }
    const routineIds = routines.map((routine) => {
      return routine.id;
    });
    await this.routineRepository.softDelete(routineIds);
  }
}
