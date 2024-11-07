import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { DataSource } from 'typeorm';

interface TEST_USER {
  email: string;
  password: string;
  name: string;
}

function createUser(app: INestApplication, user: TEST_USER) {
  return request(app.getHttpServer()).post('/users').send(user);
}

async function getUserAccessToken(app: INestApplication, user: TEST_USER) {
  const response = await request(app.getHttpServer())
    .post('/users/sign-in')
    .send({ email: user.email, password: user.password });
  return response.body.accessToken;
}

async function resetDatabase(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.query(`DELETE FROM user`);
  await queryRunner.query(`ALTER TABLE user AUTO_INCREMENT = 1`);
  await queryRunner.release();
}

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
    await resetDatabase(dataSource);
  });

  it('Given a new user, when the user signs up, then the response status should be 201', async () => {
    // Given: A new user
    const newUser: TEST_USER = { email: 'newuser@email.com', name: 'tester', password: '12345678' };

    // When: The user signs up
    const response = await request(app.getHttpServer()).post('/users').send(newUser);

    // Then: The response status should be 201
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ email: newUser.email, name: newUser.name });
  });

  it('Given an existing user, when the same user tries to sign up again, then the response status should be 409', async () => {
    // Given: An existing user
    const existingUser: TEST_USER = { email: 'newuser@email.com', name: 'tester', password: '12345678' };
    await createUser(app, existingUser);

    // When: The same user tries to sign up again
    const response = await request(app.getHttpServer()).post('/users').send(existingUser);

    // Then: The response status should be 409
    expect(response.status).toBe(409);
  });

  it('Given a registered user, when the user logs in, then the response should contain an access token and status should be 200', async () => {
    // Given: A registered user
    const registeredUser: TEST_USER = { email: 'newuser@email.com', name: 'tester', password: '12345678' };
    await createUser(app, registeredUser);
    // When: The user logs in
    const response = await request(app.getHttpServer())
      .post('/users/sign-in')
      .send({ email: registeredUser.email, password: registeredUser.password });

    // Then: The response status should be 200 and the response should contain an access token
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
  });

  it('Given a logged-in user, when the user requests their info, then the response status should be 200 and the response should contain user info', async () => {
    // Given: A logged-in user
    const registeredUser: TEST_USER = { email: 'newuser@email.com', name: 'tester', password: '12345678' };
    await createUser(app, registeredUser);
    const token = await getUserAccessToken(app, registeredUser);
    console.log(token);

    // When: The user requests their info
    const response = await request(app.getHttpServer()).get('/users').set('Authorization', `Bearer ${token}`);

    // Then: The response status should be 200 and the response should contain user info
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email', registeredUser.email);
    expect(response.body).toHaveProperty('name', registeredUser.name);
  });

  it('Given a logged-in user, when the user requests to delete their account, then the response status should be 204', async () => {
    // Given: A logged-in user
    const registeredUser: TEST_USER = { email: 'newuser@email.com', name: 'tester', password: '12345678' };
    await createUser(app, registeredUser);
    const token = await getUserAccessToken(app, registeredUser);
    // When: The user requests to delete their account
    const response = await request(app.getHttpServer()).delete('/users/').set('Authorization', `Bearer ${token}`);

    // Then: The response status should be 204
    expect(response.status).toBe(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
