import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { SaveWorkoutLogFormatDto } from '../dto/saveWorkoutLog.format.dto';
import { BodyPart } from '../../common/bodyPart.enum';
import { SaveWorkoutLogsRequestDto } from '../dto/saveWorkoutLogs.request.dto';
import { UpdateWorkoutLogsRequestDto } from '../dto/updateWorkoutLogs.request.dto';
import { UpdateWorkoutLogFormatDto } from '../dto/updateWorkoutLog.format.dto';
import { clearAndResetTable } from '../../../test/utils/dbUtils';
import { createUser, getUserAccessToken, TEST_USER } from '../../../test/utils/userUtils';

function getTodayDate() {
  const today = new Date();

  // 날짜를 지정한 시간대로 변환
  const options: Intl.DateTimeFormatOptions = {
    // timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  const formattedDate = new Intl.DateTimeFormat('en-CA', options).format(today); // 'YYYY-MM-DD' 형식으로 반환
  return formattedDate.replace(/\//g, '-');
}

describe('WorkoutLog API (e2e)', () => {
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
    await clearAndResetTable(queryRunner, 'workout_log');
    await clearAndResetTable(queryRunner, 'user');
    await clearAndResetTable(queryRunner, 'exercise');
    await queryRunner.release();
  });

  it('Given a token of a logged-in user and workoutLogs, when saving the workoutLogs, then then the response with status code should be 201.', async () => {
    // Given
    const testUser: TEST_USER = { email: 'newuser@email.com', nickName: 'tester', password: '12345678' };
    await createUser(app, testUser);
    token = await getUserAccessToken(app, testUser);

    const workoutLogs: SaveWorkoutLogFormatDto[] = [
      {
        setCount: 1,
        weight: 30,
        repeatCount: 15,
        bodyPart: BodyPart.BACK,
        exerciseName: '시티드 로우',
      },
      {
        setCount: 2,
        weight: 30,
        repeatCount: 15,
        bodyPart: BodyPart.BACK,
        exerciseName: '시티드 로우',
      },
      {
        setCount: 1,
        weight: 30,
        repeatCount: 15,
        bodyPart: BodyPart.BACK,
        exerciseName: '티바 로우',
      },
      {
        setCount: 2,
        weight: 30,
        repeatCount: 15,
        bodyPart: BodyPart.BACK,
        exerciseName: '티바 로우',
      },
    ];
    const uniqueExercises = [
      { bodyPart: BodyPart.BACK, exerciseName: '티바 로우' },
      { bodyPart: BodyPart.BACK, exerciseName: '시티드 로우' },
    ];
    const requestData = { workoutLogs, exercises: uniqueExercises };

    // When
    const response = await request(app.getHttpServer())
      .post('/workout-logs')
      .set('Authorization', `Bearer ${token}`)
      .send(requestData);

    // Then
    expect(response.status).toBe(201);
  });

  it('Given a token of a logged-in user, workoutLogs and workoutLogSavedDate, when searching workoutLogs using workoutLogSavedDate, then the response status code should be 200 and the response body length should be greater than 0', async () => {
    //Given
    const testUser: TEST_USER = { email: 'newuser@email.com', nickName: 'tester', password: '12345678' };
    await createUser(app, testUser);
    token = await getUserAccessToken(app, testUser);

    const workoutLogs: SaveWorkoutLogFormatDto[] = [
      {
        setCount: 1,
        weight: 30,
        repeatCount: 15,
        bodyPart: BodyPart.BACK,
        exerciseName: '시티드 로우',
      },
      {
        setCount: 2,
        weight: 30,
        repeatCount: 15,
        bodyPart: BodyPart.BACK,
        exerciseName: '시티드 로우',
      },
      {
        setCount: 3,
        weight: 30,
        repeatCount: 15,
        bodyPart: BodyPart.BACK,
        exerciseName: '시티드 로우',
      },
      {
        setCount: 1,
        weight: 30,
        repeatCount: 15,
        bodyPart: BodyPart.BACK,
        exerciseName: '티바 로우',
      },
      {
        setCount: 2,
        weight: 30,
        repeatCount: 15,
        bodyPart: BodyPart.BACK,
        exerciseName: '티바 로우',
      },
      {
        setCount: 3,
        weight: 30,
        repeatCount: 15,
        bodyPart: BodyPart.BACK,
        exerciseName: '티바 로우',
      },
    ];
    const uniqueExercises = [
      { bodyPart: BodyPart.BACK, exerciseName: '티바 로우' },
      { bodyPart: BodyPart.BACK, exerciseName: '시티드 로우' },
    ];
    const requestData = { workoutLogs, exercises: uniqueExercises };

    const postedWorkoutLogs = await request(app.getHttpServer())
      .post('/workout-logs')
      .set('Authorization', `Bearer ${token}`)
      .send(requestData);
    const createdDate = postedWorkoutLogs.body[0].createdAt.split('T')[0];

    // When
    const response = await request(app.getHttpServer())
      .get('/workout-logs')
      .query({ date: createdDate })
      .set('Authorization', `Bearer ${token}`);

    // Then
    expect(response.status).toBe(200);
    expect(response.body).not.toHaveLength(0);
  });

  it('Given a token of a logged-in user and workoutLogs, when searching all workoutLogs of the user, then the response status code should be 200', async () => {
    // Given
    const testUser: TEST_USER = { email: 'newuser@email.com', nickName: 'tester', password: '12345678' };
    await createUser(app, testUser);
    token = await getUserAccessToken(app, testUser);

    const userWorkoutLogs: SaveWorkoutLogsRequestDto = {
      workoutLogs: [
        {
          setCount: 1,
          weight: 20,
          repeatCount: 15,
          bodyPart: BodyPart.ABS,
          exerciseName: '레그레이즈',
        },
        {
          setCount: 2,
          weight: 25,
          repeatCount: 15,
          bodyPart: BodyPart.ABS,
          exerciseName: '레그레이즈',
        },
      ],
    };
    await request(app.getHttpServer())
      .post('/workout-logs')
      .set('Authorization', `Bearer ${token}`)
      .send(userWorkoutLogs);

    // When
    const response = await request(app.getHttpServer())
      .get('/workout-logs/user')
      .set('Authorization', `Bearer ${token}`);

    // Then
    expect(response.status).toBe(200);
  });

  it('Given a token of a logged-in user and workoutLogs, when updating the workoutLogs, then the response status code should be 200 and it should successfully reflect the updated information.', async () => {
    // Given
    const testUser: TEST_USER = { email: 'newuser@email.com', nickName: 'tester', password: '12345678' };
    await createUser(app, testUser);
    token = await getUserAccessToken(app, testUser);

    const workoutLogs: SaveWorkoutLogFormatDto[] = [
      {
        setCount: 1,
        weight: 30,
        repeatCount: 15,
        bodyPart: BodyPart.SHOULDERS,
        exerciseName: '밀리터리프레스',
      },
      {
        setCount: 2,
        weight: 35,
        repeatCount: 15,
        bodyPart: BodyPart.SHOULDERS,
        exerciseName: '밀리터리프레스',
      },
    ];

    const userWorkoutLogs: SaveWorkoutLogsRequestDto = {
      workoutLogs: workoutLogs,
    };

    await request(app.getHttpServer())
      .post('/workout-logs')
      .set('Authorization', `Bearer ${token}`)
      .send(userWorkoutLogs);

    // When
    const updateData: UpdateWorkoutLogFormatDto[] = [
      {
        id: 1,
        setCount: 1,
        weight: 40, //30 -> 40,
        repeatCount: 10, //15 -> 10
        bodyPart: BodyPart.SHOULDERS,
        exerciseName: '밀리터리프레스',
      },
      {
        id: 2,
        setCount: 2,
        weight: 45, //35 -> 45,
        repeatCount: 10, //15 -> 10
        bodyPart: BodyPart.SHOULDERS,
        exerciseName: '밀리터리프레스',
      },
    ];
    const workoutLogUpdate: UpdateWorkoutLogsRequestDto = {
      updateWorkoutLogs: updateData,
    };

    const response = await request(app.getHttpServer())
      .patch('/workout-logs')
      .set('Authorization', `Bearer ${token}`)
      .send(workoutLogUpdate);

    //Then
    expect(response.status).toBe(200);

    const checkUpdatedData = response.body.some((workoutLog: any) => workoutLog.weight === 40);
    expect(checkUpdatedData).toBe(true);
  });

  it('Given a token of logged-in user and workoutLogs, when the user delete the workoutLogs, then the response status code should be 204 and the workoutLogs should not be searched.', async () => {
    // Given
    const testUser: TEST_USER = { email: 'newuser@email.com', nickName: 'tester', password: '12345678' };
    await createUser(app, testUser);
    token = await getUserAccessToken(app, testUser);

    const workoutLogs: SaveWorkoutLogFormatDto[] = [
      {
        setCount: 1,
        weight: 30,
        repeatCount: 15,
        bodyPart: BodyPart.SHOULDERS,
        exerciseName: '밀리터리프레스',
      },
      {
        setCount: 2,
        weight: 35,
        repeatCount: 15,
        bodyPart: BodyPart.SHOULDERS,
        exerciseName: '밀리터리프레스',
      },
    ];

    const userWorkoutLogs: SaveWorkoutLogsRequestDto = {
      workoutLogs: workoutLogs,
    };
    await request(app.getHttpServer())
      .post('/workout-logs')
      .send(userWorkoutLogs)
      .set('Authorization', `Bearer ${token}`);

    // When
    const response = await request(app.getHttpServer())
      .delete('/workout-logs/')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [1, 2] });

    // Then
    expect(response.status).toBe(204);

    const searchResponse = await request(app.getHttpServer())
      .get('/workout-logs')
      .set('Authorization', `Bearer ${token}`)
      .query({ date: getTodayDate() });
    expect(searchResponse.body.length).toBe(0);
  });

  afterAll(async () => {
    await app.close();
  });
});
