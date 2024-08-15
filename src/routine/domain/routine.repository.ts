import { User } from '../../user/domain/User.entity';
import { SaveRoutinesRequestDto } from '../dto/saveRoutines.request.dto';
import { RoutineResponseDto } from '../dto/routine.response.dto';
import { GetRoutineRequestDto } from '../dto/getRoutine.request.dto';
import { UpdateRoutinesRequestDto } from '../dto/updateRoutines.request.dto';
import { DeleteRoutineRequestDto } from '../dto/deleteRoutine.request.dto';

export interface RoutineRepository {
  bulkInsertRoutines(user: User, saveRoutines: SaveRoutinesRequestDto): Promise<RoutineResponseDto[]>;
  getRoutineByName(getRoutineRequest: GetRoutineRequestDto, user: User): Promise<RoutineResponseDto[]>;
  bulkUpdateRoutines(updateRoutineRequest: UpdateRoutinesRequestDto, user: User): Promise<RoutineResponseDto[]>;
  softDeleteRoutines(deleteRoutineRequestDto: DeleteRoutineRequestDto, user: User): Promise<any>;
}
