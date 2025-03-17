import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export interface TEST_USER {
  email: string;
  password: string;
  nickName: string;
}

export function createUser(app: INestApplication, user: TEST_USER) {
  return request(app.getHttpServer()).post('/users').send(user);
}

export async function getUserAccessToken(app: INestApplication, user: TEST_USER) {
  const response = await request(app.getHttpServer())
    .post('/users/sign-in')
    .send({ email: user.email, password: user.password });
  return response.body.accessToken;
}
