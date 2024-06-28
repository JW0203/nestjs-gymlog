import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from '../domain/Exercise.entity';
import { Repository } from 'typeorm';
import { FindByExerciseNameAndBodyPart } from '../dto/findByExerciseNameAndBodyPart.request.dto';
import { SaveExerciseRequestDto } from '../dto/saveExercise.request.dto';
import { SoftDeleteRequestDto } from '../dto/softDelete.request.dto';

@Injectable()
export class ExerciseService {
  constructor(@InjectRepository(Exercise) private exerciseRepository: Repository<Exercise>) {}

  async findByExerciseNameAndBodyPart(findByExerciseNameAndBodyPart: FindByExerciseNameAndBodyPart) {
    const { exerciseName, bodyPart } = findByExerciseNameAndBodyPart;
    return await this.exerciseRepository.findOne({ where: { exerciseName, bodyPart } });
  }

  async saveExercise(saveExerciseRequestDto: SaveExerciseRequestDto): Promise<Exercise> {
    const { exerciseName, bodyPart } = saveExerciseRequestDto;
    const exercise = await this.findByExerciseNameAndBodyPart({ exerciseName, bodyPart });
    if (exercise) {
      throw new BadRequestException('Exercise already exists');
    }
    return await this.exerciseRepository.save(saveExerciseRequestDto);
  }

  async softDelete(id: number) {
    return await this.exerciseRepository.softDelete(id);
  }
}
