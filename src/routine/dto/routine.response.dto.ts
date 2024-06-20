import { UserResponseDto } from '../../user/dto/user.response.dto';

export class RoutineResponseDto {
  id: number;
  name: string;
  user: UserResponseDto;
  constructor(params: { id: number; name: string; user: UserResponseDto }) {
    if (params) {
      this.id = params.id;
      this.name = params.name;
      this.user = params.user;
    }
  }
}
