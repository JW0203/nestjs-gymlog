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

    // workoutLog 테이블 초기화 및 AUTO_INCREMENT 값을 초기화
    await queryRunner.query(`DELETE FROM workout_log`);
    await queryRunner.query(`ALTER TABLE workout_log AUTO_INCREMENT = 1`);

    // user 테이블 초기화 및 AUTO_INCREMENT 값을 초기화
    await queryRunner.query(`DELETE FROM user`);
    await queryRunner.query(`ALTER TABLE user AUTO_INCREMENT = 1`);

    // exercise 테이블 초기화 및 AUTO_INCREMENT 값을 초기화
    await queryRunner.query(`DELETE FROM exercise`);
    await queryRunner.query(`ALTER TABLE exercise AUTO_INCREMENT = 1`);

    // 새로운 유저 생성
    await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
    const signedInUser = await request(app.getHttpServer())
      .post('/users/sign-in')
      .send({ email: 'newuser@email.com', password: '12345678' });
    token = signedInUser.body.accessToken;
  });

  it('회원 가입한 유저가 운동일지를 저장하면 201 created 코드를 받아야 한다.. ', async () => {
    // Given: 가입한 유저가 기록한 운동일지
    const usersWorkoutLogs: SaveWorkoutLogFormatDto[] = [
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
    const data = { workoutLogs: usersWorkoutLogs, exercises: uniqueExercises };

    // When : 운동일지를 저장한다.
    const response = await request(app.getHttpServer())
      .post('/workout-logs')
      .set('Authorization', `Bearer ${token}`)
      .send(data);

    // Then : 201 Created 코드를 받아야 한다.
    expect(response.status).toBe(201);
  });

  it('유저가 저장한 운동일지를 날짜를 이용하여 검색하면 200 Ok 코드를 받고 응답의 길이가 0 이상이여야 한다..', async () => {
    //Given : 날짜와 저장한 운동일지
    const day = getTodayDate();
    const usersWorkoutLogs: SaveWorkoutLogFormatDto[] = [
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
    const workoutLogs = { workoutLogs: usersWorkoutLogs, exercises: uniqueExercises };

    // 저장된 운동일지
    await request(app.getHttpServer()).post('/workout-logs').set('Authorization', `Bearer ${token}`).send(workoutLogs);

    // When : date 를 이용하여 해당날의 운동일지를 찾는다.
    const response = await request(app.getHttpServer())
      .get('/workout-logs')
      .query({ date: day })
      .set('Authorization', `Bearer ${token}`);

    // Then : 200
    expect(response.status).toBe(200);
    expect(response.body).not.toHaveLength(0);
  });

  it('로그인 한 유저의 모든 운동일지를 유저의 아이디를 이용하여 검색하면 200 Ok 코드를 받아야한다.', async () => {
    // Given : 유저 토큰, 저장된 운동기록들
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
      exercises: [{ bodyPart: BodyPart.ABS, exerciseName: '레그레이즈' }],
    };
    await request(app.getHttpServer())
      .post('/workout-logs')
      .set('Authorization', `Bearer ${token}`)
      .send(userWorkoutLogs);
    // When : 유저의 아이디로 운동일지를 검색한다.
    const response = await request(app.getHttpServer())
      .get('/workout-logs/user')
      .set('Authorization', `Bearer ${token}`);

    //Then: 200 Ok 코드를 받아야한다.
    expect(response.status).toBe(200);
  });

  it('로그인 한 유저가 자신의 운동일지를 업데이트 하면 업데이트를 성공하고 200 Ok 코드를 받는다.', async () => {
    // Given :  유저 토큰과 운동기록
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
    const exercise = { bodyPart: BodyPart.SHOULDERS, exerciseName: '밀리터리프레스' };
    const userWorkoutLogs: SaveWorkoutLogsRequestDto = {
      exercises: [exercise],
      workoutLogs: workoutLogs,
    };
    await request(app.getHttpServer())
      .post('/workout-logs')
      .set('Authorization', `Bearer ${token}`)
      .send(userWorkoutLogs);
    // When: 업데이트를 한다.
    const updateData: UpdateWorkoutLogFormatDto[] = [
      {
        id: 1,
        setCount: 1,
        weight: 40, //30,
        repeatCount: 10, //15
        bodyPart: BodyPart.SHOULDERS,
        exerciseName: '밀리터리프레스',
      },
      {
        id: 2,
        setCount: 2,
        weight: 45, //35,
        repeatCount: 10, //15
        bodyPart: BodyPart.SHOULDERS,
        exerciseName: '밀리터리프레스',
      },
    ];
    const workoutLogUpdate: UpdateWorkoutLogsRequestDto = {
      updateWorkoutLogs: updateData,
      exercises: [{ bodyPart: BodyPart.SHOULDERS, exerciseName: '밀리터리프레스' }],
    };

    const response = await request(app.getHttpServer())
      .patch('/workout-logs')
      .set('Authorization', `Bearer ${token}`)
      .send(workoutLogUpdate);
    //Then: 200 Ok 코드를 받아야 하고
    expect(response.status).toBe(200);
    // 업데이트된 정보가 성공적으로 반영되어야 한다.
    const checkUpdatedData = response.body.some((workoutLog: any) => workoutLog.weight === 40);
    expect(checkUpdatedData).toBe(true);
  });

  it('유저가 자신의 운동일지를 삭제하면 삭제 성공 메세지로 204 코드를 받고 해당 운동일지 검색할 수 없다.', async () => {
    // Given : 로그인 한 유저, 저장된 운동일지
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
    const exercise = { bodyPart: BodyPart.SHOULDERS, exerciseName: '밀리터리프레스' };
    const userWorkoutLogs: SaveWorkoutLogsRequestDto = {
      exercises: [exercise],
      workoutLogs: workoutLogs,
    };
    const saveResponse = await request(app.getHttpServer())
      .post('/workout-logs')
      .send(userWorkoutLogs)
      .set('Authorization', `Bearer ${token}`);
    console.log(saveResponse.body);

    // When : 운동일지를 지운다.
    const response = await request(app.getHttpServer())
      .delete('/workout-logs/')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [1, 2] });
    // Then:204 No content 코드를 받아야한다.
    expect(response.status).toBe(204);
    // 해당 운동일지를 찾을 수가 없어야 한다.
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
