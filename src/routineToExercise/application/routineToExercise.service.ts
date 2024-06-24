import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RoutineToExercise } from '../domain/RoutineToExercise.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SaveRoutineToExerciseRequestDto } from '../dto/saveRoutineToExercise.request.dto';
import { TransformSaveRoutineResult } from '../function/transformSaveRoutineResult.function';
import { UpdateRoutineToExerciseRequestDto } from '../dto/updateRoutineToExercise.request.dto';

@Injectable()
export class RoutineToExerciseService {
  constructor(@InjectRepository(RoutineToExercise) public routineToExerciseRepository: Repository<RoutineToExercise>) {}

  async saveRelation(saveRoutineToExerciseRequest: SaveRoutineToExerciseRequestDto): Promise<RoutineToExercise> {
    const routineToExercise = await this.routineToExerciseRepository.save(saveRoutineToExerciseRequest);
    return TransformSaveRoutineResult(routineToExercise);
  }

  async update(id: number, updateRequestDto: UpdateRoutineToExerciseRequestDto) {
    const updateResult = await this.routineToExerciseRepository.update(id, { ...updateRequestDto });
    return updateResult.affected ? 'updated' : false;
  }
}
