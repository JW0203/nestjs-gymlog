import { ROUTINE_EXERCISE_REPOSITORY } from '../../common/const/inject.constant';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RoutineExerciseRepository } from '../domain/routineExercise.repository';
import { SaveRoutineExerciseRequestDto } from '../dto/saveRoutineExercise.request.dto';
import { RoutineExercise } from '../domain/RoutineExercise.entity';
import { ExerciseService } from '../../exercise/application/exercise.service';
import { SaveRoutineExerciseResponseDto } from '../dto/saveRoutineExercise.response.dto';
import { FindDataByRoutineIdRequestDto } from '../dto/findDataByRoutineId.request.dto';
import { FindDataByRoutineIdResponseDto, RoutineExerciseItemDto } from '../dto/fineDataByRoutineId.response.dto';

@Injectable()
export class RoutineExerciseService {
  constructor(
    @Inject(ROUTINE_EXERCISE_REPOSITORY)
    private readonly routineExerciseRepository: RoutineExerciseRepository,

    readonly exerciseService: ExerciseService,
  ) {}

  async saveRoutineExercises(
    saveRoutineExerciseRequestDto: SaveRoutineExerciseRequestDto[],
  ): Promise<SaveRoutineExerciseResponseDto[]> {
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
    return savedData.map((data) => {
      return {
        id: data.id,
        order: data.order,
        routineId: data.routine.id,
        routineName: data.routine.name,
        exerciseId: data.exercise.id,
        exerciseName: data.exercise.exerciseName,
        exerciseBodyPart: data.exercise.bodyPart,
      };
    });
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
    return new FindDataByRoutineIdResponseDto({ routineName: foundRoutineName, routines: foundOrderExercise });
  }
}
