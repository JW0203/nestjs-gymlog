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

  beforeEach(async () => {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    //  단순히 user 테이블 초기화
    await queryRunner.query(`DELETE FROM user`);

    // AUTO_INCREMENT 값을 초기화하
    await queryRunner.query(`ALTER TABLE user AUTO_INCREMENT = 1`);

    await queryRunner.release();
  });

  it('회원 가입 요청이 주어지면 새로운 사용자를 생성한다.', async () => {
    const signUpRequestDto = { email: 'newuser@email.com', password: '12345678', name: 'tester' };
    const response = await request(app.getHttpServer()).post('/users').send(signUpRequestDto);
    expect(response.status).toBe(201);
  });

  it('가입된 이 메일로 회원 가입 요청이 주어지면 409 Conflict 코드를 반환한다.', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'newuser@email.com', password: '12345678', name: 'tester' });

    const signUpRequestDto = { email: 'newuser@email.com', password: '12345678', name: 'tester' };
    const response = await request(app.getHttpServer()).post('/users').send(signUpRequestDto);
    expect(response.status).toBe(409);
  });

  it('회원이 로그인을 하면 200 OK 코드와 accessToken 을 받는다.', async () => {
    // 회원
    await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
    // when: 로그인을 하면
    const response = await request(app.getHttpServer())
      .post('/users/sign-in')
      .send({ email: 'newuser@email.com', password: '12345678' });
    // Then : 200 코드와 accessToken 을 받는다.
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
  });

  it('로그인 한 유저가 자신의 정보를 검색하면 200 ok 코드와 이 메일, 이름, 생성된 날짜를 받아야한다.', async () => {
    //Given : 로그인한 유저
    await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
    const signedInUser = await request(app.getHttpServer())
      .post('/users/sign-in')
      .send({ email: 'newuser@email.com', password: '12345678' });
    const token = signedInUser.body.accessToken;
    // when: 자신의 정보를 검색한다.
    const response = await request(app.getHttpServer()).get('/users').set('Authorization', `Bearer ${token}`);
    // Then: 200 ok 코드와 이 메일, 이름, 생성된 날짜 를 받아야한다
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('createdAt');
  });

  it('등록된 유저가 자신의 계정을 삭제 하려고 하면 204 No Content 코드를 받아야한다.', async () => {
    //Given : 로그인한 유저
    await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
    const signedInUser = await request(app.getHttpServer())
      .post('/users/sign-in')
      .send({ email: 'newuser@email.com', password: '12345678' });
    const token = signedInUser.body.accessToken;
    // When : 자신의 계정을 삭제하려고 한다.
    const response = await request(app.getHttpServer()).delete('/users/').set('Authorization', `Bearer ${token}`);
    // Then: 204 No Content 코드를 받아야 한다.
    expect(response.status).toBe(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
