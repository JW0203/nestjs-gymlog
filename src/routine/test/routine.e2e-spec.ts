import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import * as request from 'supertest';
import { BodyPart } from '../../common/bodyPart.enum';

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

    await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
    const signedInUser = await request(app.getHttpServer())
      .post('/users/sign-in')
      .send({ email: 'newuser@email.com', password: '12345678' });
    token = signedInUser.body.accessToken;
  });

  it('로그인한 유저가 새로운 루틴을 추가하면 201 created 코드를 받아야 하고 ', async () => {
    // Given : 로그인한 유저가 저장하는 루틴
    const routineName = '등데이';
    const exercises = [
      { bodyPart: 'Back', exerciseName: '케이블 암 풀다운' },
      { bodyPart: 'Back', exerciseName: '어시스트 풀업 머신' },
      { bodyPart: 'Back', exerciseName: '투 암 하이로우 머신' },
      { bodyPart: 'Back', exerciseName: '랫풀다운' },
    ];
    const newRoutine = createRoutine(routineName, exercises);

    // When : 저장을 한다.
    const response = await request(app.getHttpServer())
      .post('/routines')
      .set('Authorization', `Bearer ${token}`)
      .send(newRoutine);

    // Then : 201 Created 코드를 받아야 한다.
    expect(response.status).toBe(201);
    expect(response.body.length).toBe(4); // 4
  });

  it('로그인한 유저가 자신의 routines 을 루틴의 이름으로 검색하면 200 Ok 코드를 받아야하고 검색결과가 저장된 운동의 갯수와 일치해야한다.', async () => {
    // Given: 로그인한 유저와 유저가 저장한 루틴의 이름
    const routineName: string = '레그데이';
    const exercises = [
      { bodyPart: 'Legs', exerciseName: '덤벨 스쿼트' },
      { bodyPart: 'Legs', exerciseName: '케틀벨 스모 스쿼트' },
    ];
    const createdRoutine = createRoutine(routineName, exercises);

    await request(app.getHttpServer()).post('/routines/').set('Authorization', `Bearer ${token}`).send(createdRoutine);

    // When: 루틴이름으로 자신의 루틴을 검색하려고 한다.
    const response = await request(app.getHttpServer())
      .get('/routines/')
      .set('Authorization', `Bearer ${token}`)
      .query({ name: routineName });

    // Then: 200 Ok 코드를 받아야 하고 검색결과가 저장된 운동의 개수와 일치해야 한다.
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(exercises.length); //2
  });
  it('로그인한 유저가 자신의 루틴을 업데이트할 때, 업데이트된 운동 정보가 성공적으로 반영되어야 한다.', async () => {
    // Given: 로그인한 유저 , 업데이트할 루틴 정보
    const routineName: string = '가슴데이';
    const routineData = [
      { bodyPart: 'Chest', exerciseName: '푸쉬 업' },
      { bodyPart: 'Chest', exerciseName: '덤벨 인클라인' },
    ];
    const createdRoutine = createRoutine(routineName, routineData);
    await request(app.getHttpServer()).post('/routines/').set('Authorization', `Bearer ${token}`).send(createdRoutine);

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

    // When: 자신의 루틴을 업데이트하려고 시도한다.
    const response = await request(app.getHttpServer())
      .patch('/routines/')
      .set('Authorization', `Bearer ${token}`)
      .send(routineUpdate);

    // Then: 200 Ok 코드를 받아야 하고,
    expect(response.status).toBe(200);
    // 업데이트된 운동 정보가 성공적으로 반영되어야 한다.
    const containsBenchPress = response.body.some((routine: any) => routine.exercise.exerciseName === '벤치 프레스');
    expect(containsBenchPress).toBe(true);
  });

  it('로그인한 유저가 저장된 루틴 중 하나를 지우면, 204 No content 코드를 받아야하고, 해당 루틴을 찾을 수가 없어야 한다.', async () => {
    // Given: 로그인 한 유저, 저장된 루틴
    const routineName: string = '등데이';
    const routineData = [
      { bodyPart: 'Back', exerciseName: '어시스트 풀업' },
      { bodyPart: 'Back', exerciseName: '데드리프트' },
      { bodyPart: 'Back', exerciseName: '어시스트 풀업' },
    ];
    const createdRoutine = createRoutine(routineName, routineData);
    await request(app.getHttpServer()).post('/routines/').set('Authorization', `Bearer ${token}`).send(createdRoutine);

    // When: 저장된 루틴을 지운다.
    const response = await request(app.getHttpServer())
      .delete('/routines/')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [1, 2, 3] });

    // Then: 204 No content 코드를 받아야한다.
    expect(response.status).toBe(204);
    // 해당 루틴을 찾을 수가 없어야 한다.
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
