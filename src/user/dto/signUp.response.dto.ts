export class SignUpResponseDto {
  id: number;
  email: string;
  name: string;

  constructor(params: { id: number; email: string; name: string }) {
    this.id = params.id;
    this.email = params.email;
    this.name = params.name;
  }
}
