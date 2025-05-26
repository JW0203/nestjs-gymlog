import { ROUTINE_EXERCISE_REPOSITORY } from '../../common/const/inject.constant';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RoutineExerciseRepository } from '../domain/routineExercise.repository';
import { SaveRoutineExerciseRequestDto } from '../dto/saveRoutineExercise.request.dto';
import { RoutineExercise } from '../domain/RoutineExercise.entity';
import { ExerciseService } from '../../exercise/application/exercise.service';
import { SaveRoutineExerciseResponseDto } from '../dto/saveRoutineExercise.response.dto';
import { FindDataByRoutineIdRequestDto } from '../dto/findDataByRoutineId.request.dto';
import { FindDataByRoutineIdResponseDto, RoutineExerciseItemDto } from '../dto/fineDataByRoutineId.response.dto';
import { Routine } from '../../routine/domain/Routine.entity';
import { OderAndExercise } from '../../routine/dto/oderAndExercise.dto';
import { ExerciseInRoutineDto } from '../dto/exerciseInRoutine.dto';
import { SoftDeleteRoutineExercisesRequestDto } from '../dto/softDeleteRoutineExercises.request.dto';
import { Transactional } from 'typeorm-transactional';
import { SaveRoutineResponseDto } from '../../routine/dto/saveRoutine.response.dto';

type RoutineUpdateResult = { type: 'NOT_UPDATED' } | { type: 'UPDATED'; data: object };

@Injectable()
export class RoutineExerciseService {
  constructor(
    @Inject(ROUTINE_EXERCISE_REPOSITORY)
    private readonly routineExerciseRepository: RoutineExerciseRepository,

    readonly exerciseService: ExerciseService,
  ) {}

  async saveRoutineExercises(
    saveRoutineExerciseRequestDto: SaveRoutineExerciseRequestDto[],
  ): Promise<SaveRoutineResponseDto> {
    const receivedDataArray: RoutineExercise[] = saveRoutineExerciseRequestDto.map((data) => {
      return new RoutineExercise({
        order: data.order,
        routine: data.routine,
        exercise: data.exercise,
      });
    });
    const exercises = saveRoutineExerciseRequestDto.map(({ exercise }) => exercise);
    const newExercises = await this.exerciseService.findNewExercises({ exercises });
    if (newExercises.length > 0) {
      await this.exerciseService.bulkInsertExercises({ exercises: newExercises });
    }

    const exerciseEntities = await this.exerciseService.findExercisesByExerciseNameAndBodyPart(exercises);

    const saveDataArray: RoutineExercise[] = receivedDataArray.map((data) => {
      const exerciseName = data.exercise.exerciseName;
      const exerciseBodyPart = data.exercise.bodyPart;
      const exercise = exerciseEntities.find(
        (entity) => entity.exerciseName === exerciseName && entity.bodyPart === exerciseBodyPart,
      );
      if (!exercise) {
        throw new NotFoundException(`exercise (${exerciseName}, ${exerciseBodyPart}) can not found. `);
      }

      return new RoutineExercise({
        order: data.order,
        routine: data.routine,
        exercise: exercise,
      });
    });

    const savedData = await this.routineExerciseRepository.saveRoutineExercises(saveDataArray);

    return SaveRoutineResponseDto.fromEntities(savedData);
  }

  async findRoutineExercisesByRoutineId(
    requestDataByRoutineId: FindDataByRoutineIdRequestDto,
  ): Promise<FindDataByRoutineIdResponseDto> {
    const { id } = requestDataByRoutineId;
    const foundData = await this.routineExerciseRepository.findRoutineExerciseByRoutineId(id);
    if (foundData.length === 0) {
      throw new NotFoundException(`routineId ${id}:No matching data found in the RoutineExercise`);
    }

    const foundRoutineName = foundData[0].routine.name;
    const foundOrderExercise: RoutineExerciseItemDto[] = foundData.map((data) => {
      return RoutineExerciseItemDto.fromEntity(data);
    });
    return new FindDataByRoutineIdResponseDto({
      routineId: id,
      routineName: foundRoutineName,
      routines: foundOrderExercise,
    });
  }
  //todo: idObject: { ids: number[] } 수정및 dto 생성
  async findAllRoutineExercisesByRoutineIds(idObject: { ids: number[] }): Promise<FindDataByRoutineIdResponseDto[]> {
    const { ids } = idObject;
    const foundData = await this.routineExerciseRepository.findAllRoutineExerciseByRoutineIds(ids);

    if (foundData.length === 0) {
      throw new NotFoundException(`routineId ${ids}:No matching data found in the RoutineExercise`);
    }
    const routineMap = new Map<
      number,
      {
        routineId: number;
        routineName: string;
        routines: RoutineExerciseItemDto[];
      }
    >();

    for (const routineExercise of foundData) {
      const routineId = routineExercise.routine.id;
      const routineName = routineExercise.routine.name;
      const item = RoutineExerciseItemDto.fromEntity(routineExercise);

      if (!routineMap.has(routineId)) {
        routineMap.set(routineId, {
          routineId,
          routineName,
          routines: [item],
        });
      } else {
        routineMap.get(routineId)!.routines.push(item);
      }
    }

    return Array.from(routineMap.values());
  }

  async updateRoutineExercise(routine: Routine, orderAndExercises: OderAndExercise[]): Promise<RoutineUpdateResult> {
    const routineId = routine.id;

    const existingData = await this.routineExerciseRepository.findRoutineExerciseByRoutineId(routineId);

    const sortedExisting = [...existingData].sort((a, b) => a.order - b.order);
    const sortedInput = [...orderAndExercises].sort((a, b) => a.order - b.order);

    const isSameExercise =
      sortedExisting.length === sortedInput.length &&
      sortedExisting.every((item, index) => {
        const target = sortedInput[index];
        return (
          item.order === target.order &&
          item.exercise.exerciseName === target.exercise.exerciseName &&
          item.exercise.bodyPart === target.exercise.bodyPart
        );
      });

    if (isSameExercise) {
      return { type: 'NOT_UPDATED' };
    }
    const softDeleteRequest: SoftDeleteRoutineExercisesRequestDto = { routineIds: [routineId] };
    await this.softDeleteRoutineExercises(softDeleteRequest);

    const exercises = orderAndExercises.map(({ exercise }) => {
      return { exerciseName: exercise.exerciseName, bodyPart: exercise.bodyPart };
    });

    const newExercises = await this.exerciseService.findNewExercises({ exercises });
    if (newExercises.length > 0) {
      await this.exerciseService.bulkInsertExercises({ exercises: newExercises });
    }

    const exerciseEntities = await this.exerciseService.findExercisesByExerciseNameAndBodyPart(exercises);

    const updateDataArray: RoutineExercise[] = orderAndExercises.map(({ order, exercise }) => {
      const exerciseName = exercise.exerciseName;
      const exerciseBodyPart = exercise.bodyPart;
      const foundExercise = exerciseEntities.find(
        (entity) => entity.exerciseName === exerciseName && entity.bodyPart === exerciseBodyPart,
      );
      if (!foundExercise) {
        throw new NotFoundException(`exercise (${exerciseName}, ${exerciseBodyPart}) can not found. `);
      }

      return new RoutineExercise({
        order: order,
        routine,
        exercise: foundExercise,
      });
    });
    const updatedData = await this.routineExerciseRepository.updateRoutineExercise(updateDataArray);

    const routines = updatedData.map((data) => {
      return ExerciseInRoutineDto.fromData(data);
    });

    const filteredData = {
      routineId: updatedData[0].routine.id,
      routineName: updatedData[0].routine.name,
      routines,
    };
    return { type: 'UPDATED', data: filteredData };
  }

  @Transactional()
  async softDeleteRoutineExercises(softDeleteRequest: SoftDeleteRoutineExercisesRequestDto) {
    const { routineIds } = softDeleteRequest;
    const foundRoutineExercise = await this.routineExerciseRepository.findAllRoutineExerciseByRoutineIds(routineIds);
    if (foundRoutineExercise.length === 0) {
      throw new NotFoundException(`Can't delete routine. No Routine matches ID(${routineIds})`);
    }
    const ids = foundRoutineExercise.map((entity) => entity.id);
    await this.routineExerciseRepository.softDeleteRoutineExercise(ids);
  }
}
