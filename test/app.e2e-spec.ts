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
import gymLogService from './e2e.requestObject';
import { WorkoutLog } from '../src/workoutLog/domain/WorkoutLog.entity';
import { Routine } from '../src/routine/domain/Routine.entity';

function createRoutine(routineName: string, routineData: ExerciseDataFormatDto[]): SaveRoutinesRequestDto {
  const routines = routineData.map((exercise) => ({
    routineName: routineName,
    bodyPart: exercise.bodyPart,
    exerciseName: exercise.exerciseName,
  }));

  const exercises = routineData.map((exercise) => ({
    bodyPart: exercise.bodyPart,
    exerciseName: exercise.exerciseName,
  }));

  return {
    routineName: routineName,
    routines: routines,
    exercises: exercises,
  };
}

function createTestUser(email: string, password: string, name: string): SignUpRequestDto {
  return { email, password, name };
}

async function signUpAndSignIn(app: INestApplication, email: string, password: string, name: string): Promise<string> {
  // 유저
  const user = createTestUser(email, password, name);

  // 회원가입
  await gymLogService.signUp(app, user);

  // 로그인 후 accessToken 반환
  const signedUpUser = await gymLogService.signIn(app, user);
  return signedUpUser.body.accessToken;
}

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

describe('e2e test', () => {
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

  describe('AppController', () => {
    it('애플리케이션 건강 확인', () => {
      return request(app.getHttpServer()).get('/').expect(200).expect('Success Health Check!!');
    });
  });

  describe('User API 테스트', () => {
    it('유저 가입 테스트', async () => {
      // Given : 새로운 유저
      const newUser = createTestUser('newuser@email.com', '12345678', 'tester');
      // When : 가입을 시도한다.
      const response = await gymLogService.signUp(app, newUser);
      // Then : 201 Created 코드를 받아야한다.
      expect(response.status).toBe(201);
    });

    it('가입한 유저 로그인 테스트', async () => {
      // Given: 가입한 유저  signedUpUser
      const user = createTestUser('user@email.com', '12345678', 'user');
      await gymLogService.signUp(app, user);
      // When : 가입한 유저가 로그인을 시도한다.
      const response = await request(app.getHttpServer()).get('/users/').send(user);

      // Then: 200 Ok 코드를 받아야 한다.
      expect(response.status).toBe(200);
    });

    it('가입하지 않은 유저 로그인 테스트', async () => {
      // Given: 가입하지 않은 유저
      const unSignedUpUser = createTestUser('unsignedup@email.com', '12345678', 'unknown');
      // When : 가입한 유저가 로그인을 시도한다.
      const response = await gymLogService.signIn(app, unSignedUpUser);
      // Then: 400 Bad Request 코드를 받아야 한다.
      expect(response.status).toBe(400);
    });

    it('가입한 유저가 자신의 정보 검색 테스트', async () => {
      // Given: 가입한 유저의 토큰
      const token = await signUpAndSignIn(app, 'signeduser@email.com', '12345678', 'tester');

      // When : 자신의 정보 검색을 시도한다.
      // const token = singedUpUser.body.accessToken;
      const response = await request(app.getHttpServer()).get('/users/my/').set('Authorization', `Bearer ${token}`);

      // Then : 200 Ok 코드를 받아야 한다.
      expect(response.statusCode).toBe(200);
    });

    it('가입한 유저 삭제 테스트', async () => {
      // Given: 가입한 유저
      const token = await signUpAndSignIn(app, 'deleteuser@email.com', '12345678', 'delete');
      // When : 가입한 유저 삭제를 시도한다.
      const response = await request(app.getHttpServer()).delete('/users/').set('Authorization', `Bearer ${token}`);
      // Then: 204 No Content 코드를 받아야 한다.
      expect(response.status).toBe(204);
    });
  });

  describe('Exercise API 테스트', () => {
    it('새로운 운동 부위와 이름 저장', async () => {
      // Given: 한가지 이상의 새로운 운동 이름과 운동부위
      const exerciseData: ExerciseDataFormatDto[] = [
        { bodyPart: BodyPart.SHOULDERS, exerciseName: '숄더프레스' },
        { bodyPart: BodyPart.BACK, exerciseName: '시티드 로우' },
      ];

      const newExercises: SaveExercisesRequestDto = {
        exercises: exerciseData,
      };

      // When: 저장하려고 시도한다.
      const response = await gymLogService.postExercises(app, newExercises);

      // Then:  201 Created 코드를 받아야 한다.
      expect(response.status).toBe(201);
    });

    it('저장된 exercise 중 하나를 검색', async () => {
      // Given: 저장된 운동들 중 하나
      const exerciseData: ExerciseDataFormatDto[] = [{ bodyPart: BodyPart.SHOULDERS, exerciseName: '밀리터리프레스' }];
      const saveExercises: SaveExercisesRequestDto = {
        exercises: exerciseData,
      };
      await gymLogService.postExercises(app, saveExercises);

      // When: 찾으려고 시도한다.
      const response = await gymLogService.getExercise(app, exerciseData[0]);

      // Then: 200 Ok 코드를 받아야 한다.
      expect(response.status).toBe(200);
    });

    it('저장된 모든 exercises 를 검색', async () => {
      // Given : 저장된 운동들
      const exerciseData: ExerciseDataFormatDto[] = [
        { bodyPart: BodyPart.SHOULDERS, exerciseName: '어깨' },
        { bodyPart: BodyPart.BACK, exerciseName: '등' },
        { bodyPart: BodyPart.ABS, exerciseName: '복근' },
        { bodyPart: BodyPart.LEGS, exerciseName: '다리' },
        { bodyPart: BodyPart.ARM, exerciseName: '팔' },
      ];
      const newExercises: SaveExercisesRequestDto = {
        exercises: exerciseData,
      };
      await gymLogService.postExercises(app, newExercises);

      // When : 저장된 모둔 운동이름과 부위를 찾으려고 시도한다.
      const response = await request(app.getHttpServer()).get('/exercises/all/');
      // Then : 200 Ok 코드를 받아야 한다.
      expect(response.status).toBe(200);
    });

    it('저장된 exercises 의 id 를 이용하여 해당 exercises 삭제', async () => {
      // Given: 저장된 운동들의 ids
      const exerciseData: ExerciseDataFormatDto[] = [
        { bodyPart: BodyPart.LEGS, exerciseName: '고블린스퀏트' },
        { bodyPart: BodyPart.LEGS, exerciseName: '런지' },
      ];
      const newExercises: SaveExercisesRequestDto = {
        exercises: exerciseData,
      };

      await gymLogService.postExercises(app, newExercises);

      const ids: number[] = [];
      for (const exercise of exerciseData) {
        const savedExercise = await gymLogService.getExercise(app, exercise);
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
    it('로그인한 유저가 운동한 기록을 저장', async () => {
      // Given : 로그인 한 유저와 유저가 운동한 기록
      const token = await signUpAndSignIn(app, 'workout@email.com', '12345678', 'save');
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
      // 운동 부위 정보
      const exerciseData: ExerciseDataFormatDto[] = [{ bodyPart: BodyPart.SHOULDERS, exerciseName: '밀리터리프레스' }];

      const newWorkoutLogs: SaveWorkoutLogsRequestDto = {
        exercises: exerciseData,
        workoutLogs: workoutLogs,
      };

      // When : 운동한 기록을 저장하려고 한다.
      const response = await gymLogService.postWorkoutLogs(app, newWorkoutLogs, token);

      // Then : 201 Created 코드를 받아야 한다.
      expect(response.status).toBe(201);
    });

    it('로그인한 유저가 특정한 날의 운동기록을 검색', async () => {
      // Given : 로그인 한 유저 와 운동한 날짜(date)
      const token = await signUpAndSignIn(app, 'searchdate_workoutlogs@gmail.com', '1234567', 'searchdate');
      const date = getTodayDate();

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

      await gymLogService.postWorkoutLogs(app, newWorkoutLogs, token);

      // When: 특정한 날에 자신이 운동한 기록을 검색한다.
      const response = await gymLogService.getWorkoutLogsOnDate(app, date, token);

      // Then:
      expect(response.status).toBe(200);
      expect(response.body).not.toHaveLength(0);
    });

    it(' workoutLogs 를 업데이트', async () => {
      // Given : 로그인 한 유저 와 업데이트할 운동 기록
      const newToken = await signUpAndSignIn(app, 'update_workoutlogs@email.com', '12345678,', 'update');
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
      const saved = await gymLogService.postWorkoutLogs(app, newWorkoutLogs, newToken);
      const workoutLogData = saved.body;
      const updateData = workoutLogData.map((workoutLog: WorkoutLog) => {
        return {
          id: workoutLog.id,
          setCount: workoutLog.setCount,
          weight: workoutLog.weight + 10,
          repeatCount: workoutLog.repeatCount - 5,
          bodyPart: workoutLog.exercise.bodyPart,
          exerciseName: workoutLog.exercise.exerciseName,
        };
      });

      const workoutLogUpdate: UpdateWorkoutLogsRequestDto = {
        updateWorkoutLogs: updateData,
        exercises: [{ bodyPart: BodyPart.SHOULDERS, exerciseName: '밀리터리프레스' }],
      };

      // When : 운동한 기록을 업데이트/수정 하려고 시도한다.
      const response = await request(app.getHttpServer())
        .patch('/workout-logs/')
        .set('Authorization', `Bearer ${newToken}`)
        .send(workoutLogUpdate);

      // Then:
      expect(response.status).toBe(200);
      expect(response.body).not.toHaveLength(0);
    });

    it('로그인 한 유저의 모든 운동기록을 조회', async () => {
      // Given : 로그인 한 유저, 저장된 운동 기록
      const token = await signUpAndSignIn(app, 'search_workoutlogs@test.com', '12345678', 'search');

      const newWorkoutLogs: SaveWorkoutLogsRequestDto = {
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
      await gymLogService.postWorkoutLogs(app, newWorkoutLogs, token);

      // When : 자신이 기록한 모든 운동기록을 조회하려고 시도한다.
      const response = await request(app.getHttpServer())
        .get('/workout-logs/user')
        .set('Authorization', `Bearer ${token}`);

      // Then : 200 Ok 코드를 받아야 한다.
      expect(response.status).toBe(200);
    });

    it('로그인한 유저의 workoutLogs 의 id 들을 이용하여 해당 workoutLogs 를 삭제', async () => {
      // Given : 로그인 한 유저, 자신의 workoutLogs
      const token = await signUpAndSignIn(app, 'deletelogs@email.com', '12345678', 'delete');
      const newWorkoutLogs: SaveWorkoutLogsRequestDto = {
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
      await gymLogService.postWorkoutLogs(app, newWorkoutLogs, token);
      const date = getTodayDate();

      const workoutLogs = await request(app.getHttpServer())
        .get('/workout-logs/')
        .query({ date })
        .set('Authorization', `Bearer ${token}`);

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
          ids,
        });

      // Then: 204 No Content 코드를 받아야한다.
      expect(response.status).toBe(204);
    });
  });

  describe('Routine API 테스트', () => {
    const signedUpUser = {
      email: 'routine@email.com',
      password: '12345678',
      name: 'routine',
    };
    let token: string;

    beforeEach(async () => {
      await gymLogService.signUp(app, signedUpUser);
      const singInResponse = await gymLogService.signIn(app, signedUpUser);
      token = singInResponse.body.accessToken;
    });
    // Todo: 함수 생성
    it('로그인한 유저가 routines 저장 ', async () => {
      // Given: 로그인한 유저, 새로운 루틴 데이터
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

      // When: 루틴을 저장하려고 시도한다.
      const response = await request(app.getHttpServer())
        .post('/routines/')
        .set('Authorization', `Bearer ${token}`)
        .send(routine);
      // const response = await gymLogService.postRoutine(app, routineName, routine);

      // Then: 201 Created 코드를 받아야한다.
      expect(response.status).toBe(201);
      expect(response.body).not.toHaveLength(0);
    });

    it('로그인한 유저가 자신의 routines 을 루틴의 이름으로 검색', async () => {
      // Given: 로그인한 유저, 루틴 이름
      const routineName: string = '레그데이';
      const createdRoutine = createRoutine(routineName, [{ bodyPart: BodyPart.LEGS, exerciseName: '스모 스쿼트' }]);

      await request(app.getHttpServer())
        .post('/routines/')
        .set('Authorization', `Bearer ${token}`)
        .send(createdRoutine);

      // When: 루틴이름으로 자신의 루틴을 검색하려고 한다.

      const response = await request(app.getHttpServer())
        .get('/routines/')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: routineName });

      // Then: 200 Ok 코드를 받아야햔다.
      expect(response.status).toBe(200);
      expect(response.body).not.toHaveLength(0);
    });

    it('로그인한 유저가 자신의 routine 을 업데이트/수정', async () => {
      // Given: 로그인한 유저 , 업데이트할 루틴 정보

      const routineName: string = '등데이2';
      const routineData = [
        { bodyPart: BodyPart.BACK, exerciseName: '풀업' },
        { bodyPart: BodyPart.BACK, exerciseName: '사레레' },
      ];
      const createdRoutine = createRoutine(routineName, routineData);
      const savedRoutines = await gymLogService.postRoutine(app, token, createdRoutine);

      const routineInfo = savedRoutines.body;
      const newExerciseNames: string[] = ['어깨 후면', '어깨 전면'];
      const updateInfo = routineInfo.map((routine: Routine, i: number) => {
        return {
          id: routine.id,
          name: routine.name,
          exerciseName: newExerciseNames[i],
          bodyPart: routine.exercise.bodyPart,
        };
      });

      const routineUpdate: UpdateRoutinesRequestDto = {
        routineName: routineName,
        updateData: updateInfo,
        exercises: [
          { bodyPart: BodyPart.BACK, exerciseName: newExerciseNames[0] },
          { bodyPart: BodyPart.BACK, exerciseName: newExerciseNames[1] },
        ],
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
      // Given: 로그인 한 유저, 저장된
      const routineName: string = '등데이3';
      const routineData = [{ bodyPart: BodyPart.BACK, exerciseName: '어시스트 풀업' }];
      const createdRoutine = createRoutine(routineName, routineData);
      const savedRoutine = await gymLogService.postRoutine(app, token, createdRoutine);

      const savedRoutineInfo = savedRoutine.body;
      const ids = savedRoutineInfo.map((routine: Routine) => {
        return routine.id;
      });

      // When: 루틴을 지우려고 시도한다.
      const response = await request(app.getHttpServer())
        .delete('/routines/')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids });

      // Then: 204 No content 코드를 받아야한다.
      expect(response.status).toBe(204);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
