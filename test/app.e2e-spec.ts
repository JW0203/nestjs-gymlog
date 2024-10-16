import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';

describe('Test AppController (e2e) ', () => {
  let app: INestApplication;

  beforeEach(async () => {
    initializeTransactionalContext();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('배포된 애플리케이션에 접속을하면 상태코드 200을 받고 "Success Health Check!!" 메세지를 확인할 수 있다.', async () => {
    const response = await request(app.getHttpServer()).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Success Health Check!!');
  });

  afterAll(async () => {
    await app.close();
  });
});
