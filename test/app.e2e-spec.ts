import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { sign } from 'jsonwebtoken';
import { DataSource } from 'typeorm';
import { SaveRoutinesRequestDto } from '../src/routine/dto/saveRoutines.request.dto';
import { SignUpRequestDto } from '../src/user/dto/signUp.request.dto';
import { SignInRequestDto } from '../src/user/dto/signIn.request.dto';
import { BodyPart } from '../src/common/bodyPart.enum';
import { ExerciseDataFormatDto } from '../src/common/dto/exerciseData.format.dto';
import { SaveExercisesRequestDto } from '../src/excercise/dto/saveExercises.request.dto';
import { SaveWorkoutLogsRequestDto } from '../src/workoutLog/dto/saveWorkoutLogs.request.dto';
import { SaveWorkoutLogFormatDto } from '../src/workoutLog/dto/saveWorkoutLog.format.dto';

function generateTestToken(id?: number): string {
  if (id) {
    const payload = { id };
    return sign(payload, process.env.JWT_SECRET || 'mykey', { expiresIn: '1h' });
  }
  const payload = { id: 1 };
  return sign(payload, process.env.JWT_SECRET || 'mykey', { expiresIn: '1h' });
}

const mockUser: SignUpRequestDto = {
  email: 'test@email.com',
  password: '12345678',
  name: 'tester',
};

const mockLogInUser: SignInRequestDto = {
  email: 'test@email.com',
  password: '12345678',
};

const mockRoutine: SaveRoutinesRequestDto = {
  routineName: '등데이',
  routines: [
    {
      routineName: '등데이',
      bodyPart: BodyPart.BACK,
      exerciseName: '케이블 암 풀다운',
    },
  ],
  exercises: [{ bodyPart: BodyPart.BACK, exerciseName: '케이블 암 풀다운' }],
};

const mockExercise: ExerciseDataFormatDto = { bodyPart: BodyPart.SHOULDERS, exerciseName: '숄더프레스' };
const mockExercise2: ExerciseDataFormatDto = { bodyPart: BodyPart.BACK, exerciseName: '시티드 로우' };

const mockExercisesSave: SaveExercisesRequestDto = {
  exercises: [mockExercise, mockExercise2],
};

const mockWorkoutLog: SaveWorkoutLogFormatDto[] = [
  {
    setCount: 1,
    weight: 30,
    repeatCount: 15,
    bodyPart: BodyPart.BACK,
    exerciseName: '시티드 로우',
  },
  {
    setCount: 2,
    weight: 35,
    repeatCount: 15,
    bodyPart: BodyPart.BACK,
    exerciseName: '시티드 로우',
  },
];
const mockWorkoutLogSave: SaveWorkoutLogsRequestDto = {
  exercises: [mockExercise2],
  workoutLogs: mockWorkoutLog,
};

describe('e2e test', () => {
  let app: INestApplication;
  let token: string;
  let dataSource: DataSource;

  beforeAll(async () => {
    initializeTransactionalContext();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    await dataSource.dropDatabase();
    await dataSource.synchronize();
    token = generateTestToken();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('AppController', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer()).get('/').expect(200).expect('Success Health Check!!');
    });
  });

  describe('User', () => {
    it('user sign up', () => {
      return request(app.getHttpServer()).post('/users').send(mockUser).expect(201);
    });

    it('user sign in', () => {
      return request(app.getHttpServer()).get('/users/').send(mockLogInUser).expect(200);
    });

    it('my information', () => {
      return request(app.getHttpServer()).get('/users/my/').set('Authorization', `Bearer ${token}`).expect(200);
    });
  });

  describe('Exercise', () => {
    it('save exercises', () => {
      return request(app.getHttpServer()).post('/exercises/').send(mockExercisesSave).expect(201);
    });

    it('get exercises', () => {
      return request(app.getHttpServer()).get('/exercises/').send(mockExercise).expect(200);
    });

    it('get all exercises', () => {
      return request(app.getHttpServer()).get('/exercises/all/').expect(200);
    });

    it('delete  exercises', () => {
      return request(app.getHttpServer())
        .delete('/exercises/')
        .send({ ids: [1] })
        .expect(204);
    });
  });

  describe('WorkoutLogs', () => {
    it('save workoutLogs', () => {
      token = generateTestToken(1);
      return request(app.getHttpServer())
        .post('/workout-logs/')
        .set('Authorization', `Bearer ${token}`)
        .send(mockWorkoutLogSave)
        .expect(201);
    });
  });

  describe('Routine API', () => {
    it('test token', () => {
      return request(app.getHttpServer()).get('/routines/test/').set('Authorization', `Bearer ${token}`).expect(200);
    });

    // it('save routines with no token', async () => {
    //   return await request(app.getHttpServer()).post('/routines/test/').send(mockRoutine).expect(201);
    // });

    it('save routines', () => {
      return request(app.getHttpServer())
        .post('/routines/')
        .set('Authorization', `Bearer ${token}`)
        .send(mockRoutine)
        .expect(201);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
