export class UserResponseDto {
  id: number;
  email: string;
  name: string;
  constructor(params: { id: number; email: string; name: string }) {
    if (params) {
      this.id = params.id;
      this.email = params.email;
      this.name = params.name;
    }
  }
}
