import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Routine } from '../domain/Routine.entity';
import { Repository } from 'typeorm';
import { SaveRoutineRequestDto } from '../dto/saveRoutine.request.dto';
import { ExerciseService } from '../../excercise/application/exercise.service';
import { User } from '../../user/domain/User.entity';
import { RoutineToExerciseService } from '../../routineToExercise/application/routineToExercise.service';

@Injectable()
export class RoutineService {
  constructor(
    @InjectRepository(Routine) private readonly routineRepository: Repository<Routine>,
    readonly exerciseService: ExerciseService,
    readonly routineToExerciseService: RoutineToExerciseService,
  ) {}

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
}
