import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { clearAndResetTable } from '../../../test/utils/dbUtils';
import { createUser, getUserAccessToken, TEST_USER } from '../../../test/utils/userUtils';

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
    await clearAndResetTable(queryRunner, 'user');
    await clearAndResetTable(queryRunner, 'routine');
    await queryRunner.release();
  });

  it('Given a new user, when the user signs up, then the response status should be 201', async () => {
    // Given
    const newUser: TEST_USER = { email: 'newuser@email.com', nickName: 'tester', password: '12345678' };

    // When
    const response = await request(app.getHttpServer()).post('/users').send(newUser);

    // Then
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ email: newUser.email, nickName: newUser.nickName });
  });

  it('Given an existing user, when the same user tries to sign up again, then the response status should be 409', async () => {
    // Given
    const existingUser: TEST_USER = { email: 'newuser@email.com', nickName: 'tester', password: '12345678' };
    await createUser(app, existingUser);

    // When
    const response = await request(app.getHttpServer()).post('/users').send(existingUser);

    // Then
    expect(response.status).toBe(409);
  });

  it('Given a registered user, when the user logs in, then the response should contain an access token and status should be 200', async () => {
    // Given
    const registeredUser: TEST_USER = { email: 'newuser@email.com', nickName: 'tester', password: '12345678' };
    await createUser(app, registeredUser);
    // When
    const response = await request(app.getHttpServer())
      .post('/users/sign-in')
      .send({ email: registeredUser.email, password: registeredUser.password });

    // Then
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
  });

  it('Given a logged-in user, when the user requests their info, then the response status should be 200 and the response should contain user info', async () => {
    // Given
    const registeredUser: TEST_USER = { email: 'newuser@email.com', nickName: 'tester', password: '12345678' };
    await createUser(app, registeredUser);
    const token = await getUserAccessToken(app, registeredUser);

    // When
    const response = await request(app.getHttpServer()).get('/users').set('Authorization', `Bearer ${token}`);

    // Then
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email', registeredUser.email);
    expect(response.body).toHaveProperty('nickName', registeredUser.nickName);
  });

  it('Given a logged-in user, when the user requests to delete their account, then the response status should be 204', async () => {
    // Given
    const registeredUser: TEST_USER = { email: 'newuser@email.com', nickName: 'tester', password: '12345678' };
    await createUser(app, registeredUser);
    const token = await getUserAccessToken(app, registeredUser);
    // When
    const response = await request(app.getHttpServer()).delete('/users/').set('Authorization', `Bearer ${token}`);

    // Then
    expect(response.status).toBe(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
