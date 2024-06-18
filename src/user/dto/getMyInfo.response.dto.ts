export class GetMyInfoResponseDto {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: { id: number; email: string; name: string; createdAt: Date; updatedAt: Date }) {
    if (params) {
      this.id = params.id;
      this.email = params.email;
      this.name = params.name;
      this.createdAt = params.createdAt;
      this.updatedAt = params.updatedAt;
    }
  }
}
