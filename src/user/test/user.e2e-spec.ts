import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { DataSource } from 'typeorm';

describe('User API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    initializeTransactionalContext();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    await dataSource.dropDatabase();
    await dataSource.synchronize();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('회원 가입 요청이 주어지면 새로운 사용자를 생성한다.', async () => {
    const signUpRequestDto = { email: 'newuser@email.com', password: '12345678', name: 'tester' };
    const response = await request(app.getHttpServer()).post('/users').send(signUpRequestDto);
    expect(response.status).toBe(201);
  });

  it('가입된 이 메일로 회원 가입 요청이 주어지면 409 Conflict 코드를 반환한다.', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'test@email.com', password: '12345678', name: 'existing tester' });

    const signUpRequestDto = { email: 'test@email.com', password: '12345678', name: 'new tester' };
    const response = await request(app.getHttpServer()).post('/users').send(signUpRequestDto);
    expect(response.status).toBe(409);
  });

  afterAll(async () => {
    await app.close();
  });
});
