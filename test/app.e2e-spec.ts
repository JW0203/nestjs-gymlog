import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { SaveRoutinesRequestDto } from '../src/routine/dto/saveRoutines.request.dto';
import { SignUpRequestDto } from '../src/user/dto/signUp.request.dto';
import { BodyPart } from '../src/common/bodyPart.enum';
import { ExerciseDataFormatDto } from '../src/common/dto/exerciseData.format.dto';
import { SaveExercisesRequestDto } from '../src/excercise/dto/saveExercises.request.dto';
import { SaveWorkoutLogsRequestDto } from '../src/workoutLog/dto/saveWorkoutLogs.request.dto';
import { SaveWorkoutLogFormatDto } from '../src/workoutLog/dto/saveWorkoutLog.format.dto';
import { UpdateWorkoutLogsRequestDto } from '../src/workoutLog/dto/updateWorkoutLogs.request.dto';
import { UpdateRoutinesRequestDto } from '../src/routine/dto/updateRoutines.request.dto';

describe('e2e test', () => {
  let app: INestApplication;
  // let token: string;
  let dataSource: DataSource;

  beforeAll(async () => {
    initializeTransactionalContext();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    await dataSource.dropDatabase();
    await dataSource.synchronize();
    // token = generateTestToken();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('AppController', () => {
    it('애플리케이션 건강 확인', () => {
      return request(app.getHttpServer()).get('/').expect(200).expect('Success Health Check!!');
    });
  });

  describe('User API 테스트', () => {
    it('유저 가입 테스트', async () => {
      // Given : 새로운 유저가
      const newUser: SignUpRequestDto = {
        email: 'test@email.com',
        password: '12345678',
        name: 'tester',
      };
      // When : 가입을 시도한다.
      const response = await request(app.getHttpServer()).post('/users').send(newUser);
      // Then : 201 Created 코드를 받아야한다.
      expect(response.status).toBe(201);
    });

    it('가입한 유저 로그인 테스트', async () => {
      // Given: 가입한 유저
      const signedUpUser: SignUpRequestDto = {
        email: 'test1@email.com',
        password: '12345678',
        name: 'tester',
      };
      await request(app.getHttpServer()).post('/users').send(signedUpUser);

      // When : 가입한 유저가 로그인을 시도한다.
      const response = await request(app.getHttpServer()).get('/users/').send(signedUpUser);

      // Then: 200 Ok 코드를 받아야 한다.
      expect(response.status).toBe(200);
    });

    it('가입하지 않은 유저 로그인 테스트', async () => {
      // Given: 가입하지 않은 유저
      const unSignedUpUser: SignUpRequestDto = {
        email: 'unsignedup@email.com',
        password: '12345678',
        name: 'tester',
      };
      // When : 가입한 유저가 로그인을 시도한다.
      const response = await request(app.getHttpServer()).get('/users/').send(unSignedUpUser);
      // Then: 400 Bad Request 코드를 받아야 한다.
      expect(response.status).toBe(400);
    });

    it('가입한 유저가 자신의 정보 검색 테스트', async () => {
      // Given: 가입한 유저가
      const user: SignUpRequestDto = {
        email: 'test2@email.com',
        password: '12345678',
        name: 'tester',
      };
      await request(app.getHttpServer()).post('/users').send(user);
      const singedUpUser = await request(app.getHttpServer()).get('/users/').send(user);

      // When : 자신의 정보 검색을 시도한다.
      const token = singedUpUser.body.accessToken;
      const response = await request(app.getHttpServer()).get('/users/my/').set('Authorization', `Bearer ${token}`);

      // Then : 200 Ok 코드를 받아야 한다.
      expect(response.statusCode).toBe(200);
    });

    it('가입한 유저 삭제 테스트', async () => {
      // Given: 가입한 유저
      const signedUpUser: SignUpRequestDto = {
        email: 'test2@email.com',
        password: '12345678',
        name: 'tester',
      };
      const singedUpUser = await request(app.getHttpServer()).get('/users').send(signedUpUser);
      const token = singedUpUser.body.accessToken;
      // When : 가입한 유저 삭제를 시도한다.
      const response = await request(app.getHttpServer()).delete('/users/').set('Authorization', `Bearer ${token}`);
      // Then: 204 No Content 코드를 받아야 한다.
      expect(response.status).toBe(204);
    });
  });

  describe('Exercise API 테스트', () => {
    it('새로운 운동 부위와 이름 저장', async () => {
      // Given: 한가지 이상의 새로운 운동 이름과 부위를
      const newExercise1: ExerciseDataFormatDto = { bodyPart: BodyPart.SHOULDERS, exerciseName: '숄더프레스' };
      const newExercise2: ExerciseDataFormatDto = { bodyPart: BodyPart.BACK, exerciseName: '시티드 로우' };
      const newExercises: SaveExercisesRequestDto = {
        exercises: [newExercise1, newExercise2],
      };

      // When: 저장하려고 시도한다.
      const response = await request(app.getHttpServer()).post('/exercises/').send(newExercises);

      // Then:  201 Created 코드를 받아야 한다.
      expect(response.status).toBe(201);
    });

    it('저장된 exercise 중 하나를 검색', async () => {
      // Given: 저장된 운동들 중 하나를
      const exercise1: ExerciseDataFormatDto = { bodyPart: BodyPart.SHOULDERS, exerciseName: '숄더프레스' };

      // When: 찾으려고 시도한다.
      const response = await request(app.getHttpServer()).get('/exercises/').send(exercise1);

      // Then: 200 Ok 코드를 받아야 한다.
      expect(response.status).toBe(200);
    });

    it('저장된 모든 exercises 를 검색', async () => {
      // Given : 없음
      // When : 저장된 모둔 운동이름과 부위를 찾으려고 시도한다.
      const response = await request(app.getHttpServer()).get('/exercises/all/');
      // Then : 200 Ok 코드를 받아야 한다.
      expect(response.status).toBe(200);
    });

    it('저장된 exercises 의 id 를 이용하여 해당 exercises 삭제', async () => {
      // Given: 저장된 운동 중에 한가지 이상의 운동의 아이디를 찾아서
      const newExercise1: ExerciseDataFormatDto = { bodyPart: BodyPart.SHOULDERS, exerciseName: '숄더프레스' };
      const newExercise2: ExerciseDataFormatDto = { bodyPart: BodyPart.BACK, exerciseName: '시티드 로우' };
      const newExercises: SaveExercisesRequestDto = {
        exercises: [newExercise1, newExercise2],
      };
      await request(app.getHttpServer()).post('/exercises/').send(newExercises);
      const ids: number[] = [];
      for (const exercise of [newExercise1, newExercise2]) {
        const savedExercise = await request(app.getHttpServer()).get('/exercises/').send(exercise);
        const exerciseId = savedExercise.body.id;
        ids.push(exerciseId);
      }

      // When: 아이디를 이용해서 지우려고 시도한다.
      const response = await request(app.getHttpServer()).delete('/exercises/').send({ ids });

      // Then: 204 No Content 코드를 받아야 한다.
      expect(response.status).toBe(204);
    });
  });

  describe('WorkoutLogs API 테스트', () => {
    const signedUpUser = {
      email: 'test3@email.com',
      password: '12345678',
      name: 'tester',
    };
    beforeAll(async () => {
      await request(app.getHttpServer()).post('/users').send(signedUpUser);
    });

    it('로그인한 유저가 운동한 기록을 저장', async () => {
      // Given : 로그인 한 유저가
      const singedUpUser = await request(app.getHttpServer()).get('/users').send(signedUpUser);
      const token = singedUpUser.body.accessToken;

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
      const exercise: ExerciseDataFormatDto = { bodyPart: BodyPart.SHOULDERS, exerciseName: '밀리터리프레스' };
      const newWorkoutLogs: SaveWorkoutLogsRequestDto = {
        exercises: [exercise],
        workoutLogs: workoutLogs,
      };

      // When : 운동을 저장하려고 한다.
      const response = await request(app.getHttpServer())
        .post('/workout-logs/')
        .set('Authorization', `Bearer ${token}`)
        .send(newWorkoutLogs);

      // Then : 201 Created 코드를 받아야 한다.
      expect(response.status).toBe(201);
    });

    it('로그인한 유저가 특정한 날의 운동기록을 검색', async () => {
      // Given : 로그인 한 유저가
      const singedUpUser = await request(app.getHttpServer()).get('/users').send(signedUpUser);
      const token = singedUpUser.body.accessToken;

      // When: 특정한 날에 자신이 운동한 기록을 검색한다.
      const response = await request(app.getHttpServer())
        .get('/workout-logs/')
        .query({ data: '2024-09-17' })
        .set('Authorization', `Bearer ${token}`);

      // Then:
      expect(response.status).toBe(200);
      expect(response.body).not.toHaveLength(0);
    });

    it(' workoutLogs 를 업데이트', async () => {
      // Given : 로그인 한 유저 가
      const singedUpUser = await request(app.getHttpServer()).get('/users').send(signedUpUser);
      const token = singedUpUser.body.accessToken;
      const workoutLogUpdate: UpdateWorkoutLogsRequestDto = {
        updateWorkoutLogs: [
          {
            id: 1,
            setCount: 1,
            weight: 20,
            repeatCount: 15,
            bodyPart: BodyPart.ABS,
            exerciseName: '레그레이즈',
          },
          {
            id: 2,
            setCount: 2,
            weight: 25,
            repeatCount: 15,
            bodyPart: BodyPart.ABS,
            exerciseName: '레그레이즈',
          },
        ],
        exercises: [{ bodyPart: BodyPart.ABS, exerciseName: '레그레이즈' }],
      };

      // When : 운동한 기록을 업데이트/수정 하려고 시도한다.
      const response = await request(app.getHttpServer())
        .patch('/workout-logs/')
        .set('Authorization', `Bearer ${token}`)
        .send(workoutLogUpdate);

      // Then:
      expect(response.status).toBe(200);
      expect(response.body).not.toHaveLength(0);
    });

    it('get workoutLogs of user', async () => {
      // Given : 로그인 한 유저 4 가
      const singedUpUser = await request(app.getHttpServer()).get('/users').send(signedUpUser);
      const token = singedUpUser.body.accessToken;

      // When : 자신이 기록한 모든 운동기록을 조회하려고 시도한다.
      const response = await request(app.getHttpServer())
        .get('/workout-logs/user')
        .set('Authorization', `Bearer ${token}`);
      // Then :
      expect(response.status).toBe(200);
    });

    it('로그인한 유저의 workoutLogs 의 id 들을 이용하여 해당 workoutLogs 를 삭제', async () => {
      // Given : 로그인 한 유저 가 자신의 workoutLogs 을
      const singedUpUser = await request(app.getHttpServer()).get('/users').send(signedUpUser);
      const token = singedUpUser.body.accessToken;
      const workoutLogs = await request(app.getHttpServer())
        .get('/workout-logs/')
        .query({ data: '2024-09-17' })
        .set('Authorization', `Bearer ${token}`);
      console.log(workoutLogs.body);
      expect(workoutLogs.body).not.toHaveLength(0);
      const info = workoutLogs.body;
      const ids: number[] = [];
      for (const i of info) {
        ids.push(i.id);
      }

      // When: workoutLogs 의 id 를 이용하여 지우려고 시도한다.
      const response = await request(app.getHttpServer())
        .delete('/workout-logs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          // ids
          ids: [1, 2],
        });

      // Then: 204 No Content 코드를 받아야한다.
      expect(response.status).toBe(204);
    });
  });

  describe('Routine API 테스트', () => {
    const signedUpUser = {
      email: 'test4@email.com',
      password: '12345678',
      name: 'tester',
    };
    let token: string;

    beforeAll(async () => {
      await request(app.getHttpServer()).post('/users').send(signedUpUser);
      const singedUpUser = await request(app.getHttpServer()).get('/users').send(signedUpUser);
      token = singedUpUser.body.accessToken;
    });

    it('로그인한 유저가 routines 저장 ', async () => {
      // Given: 유저 test4@email.com
      // const singedUpUser = await request(app.getHttpServer()).get('/users').send(signedUpUser);
      // const token = singedUpUser.body.accessToken;

      // When: 루틴을 저장하려고 시도한다.
      const routineName: string = '등데이';
      const routine: SaveRoutinesRequestDto = {
        routineName: routineName,
        routines: [
          {
            routineName: routineName,
            bodyPart: BodyPart.BACK,
            exerciseName: '케이블 암 풀다운',
          },
        ],
        exercises: [{ bodyPart: BodyPart.BACK, exerciseName: '케이블 암 풀다운' }],
      };
      const response = await request(app.getHttpServer())
        .post('/routines/')
        .set('Authorization', `Bearer ${token}`)
        .send(routine);

      // Then: 201 Created 코드를 받아야한다.
      expect(response.status).toBe(201);
      expect(response.body).not.toHaveLength(0);
    });

    it('로그인한 유저가 자신의 routines 을 루틴의 이름으로 검색', async () => {
      // Given: 유저 test4@email.com

      // When: 루틴이름으로 자신의 루틴을 검색하려고 한다.
      const routineName: string = '등데이';
      const response = await request(app.getHttpServer())
        .get('/routines/')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: routineName });

      // Then: 200 Ok 코드를 받아야햔다.
      expect(response.status).toBe(200);
      expect(response.body).not.toHaveLength(0);
    });

    it('로그인한 유저가 자신의 routine 을 업데이트/수정', async () => {
      // Given:유저 test4@email.com , 업데이트할 루틴 정보

      const routineName: string = '등데이';
      const routineUpdate: UpdateRoutinesRequestDto = {
        routineName: routineName,
        updateData: [
          {
            id: 1,
            routineName: '다리 데이',
            bodyPart: BodyPart.LEGS,
            exerciseName: '스모데드리프트',
          },
        ],
        exercises: [{ bodyPart: BodyPart.LEGS, exerciseName: '스모데드리프트' }],
      };

      // When: 자신의 루틴을 업데이트하려고 시도한다.
      const response = await request(app.getHttpServer())
        .patch('/routines/')
        .set('Authorization', `Bearer ${token}`)
        .send(routineUpdate);

      // Then: 200 Ok 코드를 받아야 한다.
      expect(response.status).toBe(200);
      expect(response.body).not.toHaveLength(0);
    });

    it('delete routines', async () => {
      // Given: 유저 test4@email.com
      const singedUpUser = await request(app.getHttpServer()).get('/users').send(signedUpUser);
      const token = singedUpUser.body.accessToken;

      // When: 루틴을 지우려고 시도한다.
      const response = await request(app.getHttpServer())
        .delete('/routines/')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [1] });

      // Then: 204 No content 코드를 받아야한다.
      expect(response.status).toBe(204);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
