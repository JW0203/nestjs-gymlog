import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import * as request from 'supertest';
import { BodyPart } from '../../common/bodyPart.enum';

interface TEST_USER {
  email: string;
  name: string;
  password: string;
}

async function createUser(app: INestApplication, user: TEST_USER) {
  await request(app.getHttpServer())
    .post('/users')
    .send({ email: user.email, password: user.password, name: user.name });
}

async function getUserAccessToken(app: INestApplication, user: TEST_USER): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/users/sign-in')
    .send({ email: user.email, password: user.password });
  return response.body.accessToken;
}

function createRoutine(routineName: string, exercises: any[]) {
  const routines: { routineName: string; bodyPart: BodyPart; exerciseName: string }[] = [];
  exercises.forEach((exercise) =>
    routines.push({ routineName, bodyPart: exercise.bodyPart, exerciseName: exercise.exerciseName }),
  );
  return { routineName, routines, exercises };
}

describe('Routine', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;

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

    // routine 테이블 초기화
    await queryRunner.query(`DELETE FROM routine`);
    // AUTO_INCREMENT 값을 초기화
    await queryRunner.query(`ALTER TABLE routine AUTO_INCREMENT = 1`);

    // user 테이블 초기화
    await queryRunner.query(`DELETE FROM user`);
    // AUTO_INCREMENT 값을 초기화
    await queryRunner.query(`ALTER TABLE user AUTO_INCREMENT = 1`);

    await queryRunner.release();

    const newUser: TEST_USER = { email: 'newuser@email.com', password: '12345678', name: 'tester' };
    await createUser(app, newUser);
    token = await getUserAccessToken(app, newUser);
  });

  it('Given a logged-in user and a routine containing 4 exercises, when creating the new routine, then the response with status code should be 201 and response body should contain the 4 exercises', async () => {
    // Given : logged-in user and a routine data with exercises
    const routineName = '등데이';
    const exercises = [
      { bodyPart: 'Back', exerciseName: '케이블 암 풀다운' },
      { bodyPart: 'Back', exerciseName: '어시스트 풀업 머신' },
      { bodyPart: 'Back', exerciseName: '투 암 하이로우 머신' },
      { bodyPart: 'Back', exerciseName: '랫풀다운' },
    ];
    const newRoutine = createRoutine(routineName, exercises);

    // When : creating the new routine
    const response = await request(app.getHttpServer())
      .post('/routines')
      .set('Authorization', `Bearer ${token}`)
      .send(newRoutine);

    // Then : the response with status code should be 201
    expect(response.status).toBe(201);
    // response body should contain the 4 exercises
    expect(response.body.length).toBe(4); // 4
  });
  //로그인한 유저가 자신의 routines 을 루틴의 이름으로 검색하면 200 Ok 코드를 받아야하고 검색결과가 저장된 운동의 갯수와 일치해야한다.
  it('Given a logged-in user with an existing routine, when searching routine by routine name, then the response with status code should be 200 and the length of response body should match the number of exercises in found routine ', async () => {
    // Given: a logged-in user with an existing routine
    const routineName: string = '레그데이';
    const exercises = [
      { bodyPart: 'Legs', exerciseName: '덤벨 스쿼트' },
      { bodyPart: 'Legs', exerciseName: '케틀벨 스모 스쿼트' },
    ];
    const createdRoutine = createRoutine(routineName, exercises);

    await request(app.getHttpServer()).post('/routines/').set('Authorization', `Bearer ${token}`).send(createdRoutine);

    // When: searching routine by routine name
    const response = await request(app.getHttpServer())
      .get('/routines/')
      .set('Authorization', `Bearer ${token}`)
      .query({ name: routineName });

    // Then: response with status code should be 200
    expect(response.status).toBe(200);
    // the length of response body should match the number of exercises in found routine
    expect(response.body.length).toBe(exercises.length); //2
  });
  it('Given a logged-in user with an existing routine, when updating routine, then the response with status code should be 200 and updated information should be successfully reflected', async () => {
    // Given: a logged-in user with an existing routine
    const routineName: string = '가슴데이';
    const routineData = [
      { bodyPart: 'Chest', exerciseName: '푸쉬 업' },
      { bodyPart: 'Chest', exerciseName: '덤벨 인클라인' },
    ];
    const createdRoutine = createRoutine(routineName, routineData);
    await request(app.getHttpServer()).post('/routines/').set('Authorization', `Bearer ${token}`).send(createdRoutine);

    // When: updating routine
    // update info
    const updateInfo = [
      { id: 1, name: routineName, exerciseName: '벤치 프레스', bodyPart: 'Chest' },
      { id: 2, name: routineName, exerciseName: '덤벨 인클라인', bodyPart: 'Chest' },
    ];

    const routineUpdate = {
      routineName: '가슴데이',
      updateData: updateInfo,
      exercises: [
        { bodyPart: 'Chest', exerciseName: '벤치 프레스' },
        { bodyPart: 'Chest', exerciseName: '덤벨 인클라인' },
      ],
    };
    const response = await request(app.getHttpServer())
      .patch('/routines/')
      .set('Authorization', `Bearer ${token}`)
      .send(routineUpdate);

    // Then:  the response with status code should be 200
    expect(response.status).toBe(200);
    // The updated information should be successfully reflected
    const containsBenchPress = response.body.some((routine: any) => routine.exercise.exerciseName === '벤치 프레스');
    expect(containsBenchPress).toBe(true);
  });

  it('Given a logged-in user with an existing routine, when deleting a routine, then the response with status code should be 204 and the deleted routine should not be found.', async () => {
    // Given: existing routine
    const routineName: string = '등데이';
    const routineData = [
      { bodyPart: 'Back', exerciseName: '어시스트 풀업' },
      { bodyPart: 'Back', exerciseName: '데드리프트' },
      { bodyPart: 'Back', exerciseName: '어시스트 풀업' },
    ];
    const createdRoutine = createRoutine(routineName, routineData);
    await request(app.getHttpServer()).post('/routines/').set('Authorization', `Bearer ${token}`).send(createdRoutine);

    // When: deleting a routine
    const response = await request(app.getHttpServer())
      .delete('/routines/')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [1, 2, 3] });

    // Then: the response with status code should be 204
    expect(response.status).toBe(204);
    // the deleted routine should not be found
    const queryResponse = await request(app.getHttpServer())
      .get('/routines/')
      .set('Authorization', `Bearer ${token}`)
      .query({ name: '등데이' });
    console.log(queryResponse.status);
    console.log(queryResponse.body);
    expect(queryResponse.status).toBe(404);
  });

  afterAll(async () => {
    app.close();
  });
});
