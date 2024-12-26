import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import * as request from 'supertest';
import { BodyPart } from '../../common/bodyPart.enum';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { UpdateRoutine } from '../dto/updateRoutine.format.dto';
import { UpdateRoutinesRequestDto } from '../dto/updateRoutines.request.dto';
import { SaveRoutinesRequestDto } from '../dto/saveRoutines.request.dto';
import { clearAndResetTable } from '../../../test/utils/dbUtils';
import { createUser, getUserAccessToken, TEST_USER } from '../../../test/utils/userUtils';

function createRoutineData(routineName: string, exercises: ExerciseDataFormatDto[]) {
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
    await clearAndResetTable(queryRunner, 'routine');
    await clearAndResetTable(queryRunner, 'user');
    await queryRunner.release();
  });

  it('Given a token of a logged-in user and a routine containing 4 exercises, when creating the new routine, then the response with status code should be 201 and response body should contain the 4 exercises', async () => {
    // Given
    const newUser: TEST_USER = { email: 'newuser@email.com', password: '12345678', name: 'tester' };
    await createUser(app, newUser);
    token = await getUserAccessToken(app, newUser);

    const routineName = '등데이';
    const exercises: ExerciseDataFormatDto[] = [
      { bodyPart: BodyPart.BACK, exerciseName: '케이블 암 풀다운' },
      { bodyPart: BodyPart.BACK, exerciseName: '어시스트 풀업 머신' },
      { bodyPart: BodyPart.BACK, exerciseName: '투 암 하이로우 머신' },
      { bodyPart: BodyPart.BACK, exerciseName: '랫풀다운' },
    ];
    const newRoutine: SaveRoutinesRequestDto = createRoutineData(routineName, exercises);

    // When
    const response = await request(app.getHttpServer())
      .post('/routines')
      .set('Authorization', `Bearer ${token}`)
      .send(newRoutine);

    // Then
    expect(response.status).toBe(201);
    expect(response.body.length).toBe(exercises.length); // 4
  });

  it('Given a token of a logged-in user and an existing routine, when searching routine by routine name, then the response with status code should be 200 and the length of response body should match the number of exercises in found routine ', async () => {
    // Given
    const newUser: TEST_USER = { email: 'newuser@email.com', password: '12345678', name: 'tester' };
    await createUser(app, newUser);
    token = await getUserAccessToken(app, newUser);

    const routineName: string = '레그데이';
    const exercises: ExerciseDataFormatDto[] = [
      { bodyPart: BodyPart.LEGS, exerciseName: '덤벨 스쿼트' },
      { bodyPart: BodyPart.LEGS, exerciseName: '케틀벨 스모 스쿼트' },
    ];
    const existingRoutine: SaveRoutinesRequestDto = createRoutineData(routineName, exercises);
    await request(app.getHttpServer()).post('/routines/').set('Authorization', `Bearer ${token}`).send(existingRoutine);

    // When
    const response = await request(app.getHttpServer())
      .get('/routines/')
      .set('Authorization', `Bearer ${token}`)
      .query({ name: routineName });

    // Then
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(exercises.length);
  });

  it('Given a token of a logged-in user and an existing routine, when updating routine, then the response with status code should be 200 and updated information should be successfully reflected', async () => {
    // Given
    const newUser: TEST_USER = { email: 'newuser@email.com', password: '12345678', name: 'tester' };
    await createUser(app, newUser);
    token = await getUserAccessToken(app, newUser);

    const routineName: string = '가슴데이';
    const routineData: ExerciseDataFormatDto[] = [
      { bodyPart: BodyPart.CHEST, exerciseName: '푸쉬 업' },
      { bodyPart: BodyPart.CHEST, exerciseName: '덤벨 인클라인' },
    ];
    const existingRoutine: SaveRoutinesRequestDto = createRoutineData(routineName, routineData);
    await request(app.getHttpServer()).post('/routines/').set('Authorization', `Bearer ${token}`).send(existingRoutine);

    // When
    const routineExerciseNameUpdate: UpdateRoutine[] = [
      { id: 1, routineName: routineName, exerciseName: '벤치 프레스', bodyPart: BodyPart.CHEST },
      { id: 2, routineName: routineName, exerciseName: '덤벨 인클라인', bodyPart: BodyPart.CHEST },
    ];

    const routineUpdate: UpdateRoutinesRequestDto = {
      updateData: routineExerciseNameUpdate,
    };
    
    const response = await request(app.getHttpServer())
      .patch('/routines/')
      .set('Authorization', `Bearer ${token}`)
      .send(routineUpdate);

    // Then
    expect(response.status).toBe(200);
    const containsBenchPress = response.body.some((routine: any) => routine.exercise.exerciseName === '벤치 프레스');
    expect(containsBenchPress).toBe(true);
  });

  it('Given a logged-in user with an existing routine, when deleting a routine, then the response with status code should be 204 and the deleted routine should not be found.', async () => {
    // Given
    const newUser: TEST_USER = { email: 'newuser@email.com', password: '12345678', name: 'tester' };
    await createUser(app, newUser);
    token = await getUserAccessToken(app, newUser);

    const routineName: string = '등데이';
    const routineData: ExerciseDataFormatDto[] = [
      { bodyPart: BodyPart.BACK, exerciseName: '어시스트 풀업' },
      { bodyPart: BodyPart.BACK, exerciseName: '데드리프트' },
      { bodyPart: BodyPart.BACK, exerciseName: '어시스트 풀업' },
    ];
    const existingRoutine: SaveRoutinesRequestDto = createRoutineData(routineName, routineData);
    await request(app.getHttpServer()).post('/routines/').set('Authorization', `Bearer ${token}`).send(existingRoutine);

    // When
    const response = await request(app.getHttpServer())
      .delete('/routines/')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [1, 2, 3] });

    // Then
    expect(response.status).toBe(204);

    const queryResponse = await request(app.getHttpServer())
      .get('/routines/')
      .set('Authorization', `Bearer ${token}`)
      .query({ name: '등데이' });
    expect(queryResponse.status).toBe(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
