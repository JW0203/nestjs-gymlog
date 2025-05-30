import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import * as request from 'supertest';
import { BodyPart } from '../../common/bodyPart.enum';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { UpdateRoutine } from '../dto/updateRoutine.dto';
import { UpdateRoutinesRequestDto } from '../dto/updateRoutines.request.dto';
import { clearAndResetTable } from '../../../test/utils/dbUtils';
import { createUser, getUserAccessToken, TEST_USER } from '../../../test/utils/userUtils';
import { createAndSaveTestRoutineRepo } from '../../../test/utils/createAndSaveTestRoutine.repo.layer';
import { SaveRoutineRequestDto } from '../dto/saveRoutine.request.dto';
import { SaveRoutineExerciseRequestDto } from '../../routineExercise/dto/saveRoutineExercise.request.dto';
import { OderAndExercise } from '../dto/oderAndExercise.dto';
import {
  FindDataByRoutineIdResponseDto,
  RoutineExerciseItemDto,
} from '../../routineExercise/dto/fineDataByRoutineId.response.dto';
import { IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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
    await clearAndResetTable(queryRunner, 'routine_exercise');
    await clearAndResetTable(queryRunner, 'routine');
    await clearAndResetTable(queryRunner, 'user');
    await clearAndResetTable(queryRunner, 'exercise');
    await queryRunner.release();
  });

  it(`Given a token of a logged-in user, a routine name, and routine with 4 exercises
       when creating the new routine, 
       then then it should return 201 with routineId, routineName, and routine with 4 exercises`, async () => {
    const user: TEST_USER = { email: 'newuser@email.com', password: '12345678', nickName: 'tester' };
    await createUser(app, user);
    token = await getUserAccessToken(app, user);

    const routineName = 'Back routine';
    const orderAndExercise: OderAndExercise[] = [
      { order: 1, bodyPart: BodyPart.BACK, exerciseName: 'cable arm pull down' },
      { order: 2, bodyPart: BodyPart.BACK, exerciseName: 'assist pull up machine' },
      { order: 3, bodyPart: BodyPart.BACK, exerciseName: 'High row machine' },
      { order: 4, bodyPart: BodyPart.BACK, exerciseName: 'lat pull down' },
    ];

    const requestData: SaveRoutineRequestDto = {
      routineName,
      orderAndExercise,
    };

    const response = await request(app.getHttpServer())
      .post('/routines')
      .set('Authorization', `Bearer ${token}`)
      .send(requestData);

    expect(response.status).toBe(201);
    expect(response.body.routineId).toBe(1);
    expect(response.body.routineName).toBe('Back routine');
    expect(response.body.routines.length).toBe(4);
  });

  it('Given a token of a logged-in user, when searching for their routine by routine name, then it should return 200 with the corresponding routine', async () => {
    const newUser: TEST_USER = { email: 'newuser@email.com', password: '12345678', nickName: 'tester' };
    await createUser(app, newUser);
    token = await getUserAccessToken(app, newUser);

    const routineName = 'Back routine';
    const orderAndExercise: OderAndExercise[] = [
      { order: 1, bodyPart: BodyPart.BACK, exerciseName: 'cable arm pull down' },
      { order: 2, bodyPart: BodyPart.BACK, exerciseName: 'assist pull up machine' },
    ];

    const requestData: SaveRoutineRequestDto = {
      routineName,
      orderAndExercise,
    };

    await request(app.getHttpServer()).post('/routines/').set('Authorization', `Bearer ${token}`).send(requestData);

    const response = await request(app.getHttpServer())
      .get('/routines/')
      .set('Authorization', `Bearer ${token}`)
      .query({ name: routineName });

    expect(response.status).toBe(200);
    expect(response.body.routineName).toBe('Back routine');
    expect(response.body.routines[0].exerciseName).toBe('cable arm pull down');
    expect(response.body.routines[1].exerciseName).toBe('assist pull up machine');
  });

  it('Given a token of a logged-in user, when searching for all routines by their id, then it should return 200 with the corresponding routine', async () => {
    const user: TEST_USER = { email: 'newuser@email.com', password: '12345678', nickName: 'tester' };
    await createUser(app, user);
    token = await getUserAccessToken(app, user);

    const routineName = 'Back routine';
    const orderAndExercise: OderAndExercise[] = [
      { order: 1, bodyPart: BodyPart.BACK, exerciseName: 'cable arm pull down' },
      { order: 2, bodyPart: BodyPart.BACK, exerciseName: 'assist pull up machine' },
    ];

    const requestData: SaveRoutineRequestDto = {
      routineName,
      orderAndExercise,
    };

    await request(app.getHttpServer()).post('/routines/').set('Authorization', `Bearer ${token}`).send(requestData);

    const routineName2: string = 'Chest Day';
    const orderAndExercise2: OderAndExercise[] = [
      { order: 1, bodyPart: BodyPart.CHEST, exerciseName: 'push up' },
      { order: 2, bodyPart: BodyPart.CHEST, exerciseName: 'dumbbell incline' },
    ];

    const requestData2: SaveRoutineRequestDto = {
      routineName: routineName2,
      orderAndExercise: orderAndExercise2,
    };

    await request(app.getHttpServer()).post('/routines/').set('Authorization', `Bearer ${token}`).send(requestData2);

    const requestingUser: TEST_USER = { email: 'newuser2@email.com', password: '12345678', nickName: 'tester2' };
    await createUser(app, requestingUser);
    token = await getUserAccessToken(app, requestingUser);

    const routineName3: string = 'Leg routine';
    const orderAndExercise3: OderAndExercise[] = [
      { order: 1, bodyPart: BodyPart.LEGS, exerciseName: 'hack squat' },
      { order: 2, bodyPart: BodyPart.LEGS, exerciseName: 'pendulum squat' },
    ];
    const requestData3: SaveRoutineRequestDto = {
      routineName: routineName3,
      orderAndExercise: orderAndExercise3,
    };

    await request(app.getHttpServer()).post('/routines/').set('Authorization', `Bearer ${token}`).send(requestData3);

    const response = await request(app.getHttpServer()).get('/routines/all').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].routineId).toBe(3);
    expect(response.body[0].routineName).toBe('Leg routine');
    expect(response.body[0].routines[0].exerciseName).toBe('hack squat');
  });

  it('Given a token of a logged-in user and an existing routine, when updating routine, then the response with status code should be 200 and updated information should be successfully reflected', async () => {
    const user: TEST_USER = { email: 'newuser@email.com', password: '12345678', nickName: 'tester' };
    await createUser(app, user);
    token = await getUserAccessToken(app, user);

    const routineName: string = 'Chest Day';
    const orderAndExercise: OderAndExercise[] = [
      { order: 1, bodyPart: BodyPart.CHEST, exerciseName: 'push up' },
      { order: 2, bodyPart: BodyPart.CHEST, exerciseName: 'dumbbell incline' },
    ];

    const requestData: SaveRoutineRequestDto = {
      routineName,
      orderAndExercise,
    };

    await request(app.getHttpServer()).post('/routines/').set('Authorization', `Bearer ${token}`).send(requestData);

    const updateData: UpdateRoutine[] = [
      { order: 1, bodyPart: BodyPart.CHEST, exerciseName: 'push up' },
      { order: 2, bodyPart: BodyPart.CHEST, exerciseName: 'dumbbell incline' },
      { order: 3, bodyPart: BodyPart.CHEST, exerciseName: 'pec deck fly' },
    ];

    const routineUpdate: UpdateRoutinesRequestDto = {
      routineId: 1,
      routineName: 'Chest Day',
      updateData,
    };

    const response = await request(app.getHttpServer())
      .patch('/routines/')
      .set('Authorization', `Bearer ${token}`)
      .send(routineUpdate);

    expect(response.status).toBe(200);
    expect(response.body.updated.routines[2].order).toBe(3);
    expect(response.body.updated.routines[2].exerciseName).toBe('pec deck fly');
  });

  it('Given a token of a logged-in user with an existing routine, when deleting a routine, then the response with status code should be 204 and the deleted routine should not be found.', async () => {
    const user: TEST_USER = { email: 'newuser@email.com', password: '12345678', nickName: 'tester' };
    await createUser(app, user);
    token = await getUserAccessToken(app, user);

    const routineName: string = 'Leg routine';
    const orderAndExercise: OderAndExercise[] = [
      { order: 1, bodyPart: BodyPart.LEGS, exerciseName: 'hack squat' },
      { order: 2, bodyPart: BodyPart.LEGS, exerciseName: 'pendulum squat' },
    ];
    const requestData: SaveRoutineRequestDto = {
      routineName,
      orderAndExercise,
    };

    await request(app.getHttpServer()).post('/routines/').set('Authorization', `Bearer ${token}`).send(requestData);

    const routineName2: string = 'Chest Day';
    const orderAndExercise2: OderAndExercise[] = [
      { order: 1, bodyPart: BodyPart.CHEST, exerciseName: 'push up' },
      { order: 2, bodyPart: BodyPart.CHEST, exerciseName: 'dumbbell incline' },
    ];

    const requestData2: SaveRoutineRequestDto = {
      routineName: routineName2,
      orderAndExercise: orderAndExercise2,
    };

    await request(app.getHttpServer()).post('/routines/').set('Authorization', `Bearer ${token}`).send(requestData2);

    const routineName3 = 'Back routine';
    const orderAndExercise3: OderAndExercise[] = [
      { order: 1, bodyPart: BodyPart.BACK, exerciseName: 'cable arm pull down' },
      { order: 2, bodyPart: BodyPart.BACK, exerciseName: 'assist pull up machine' },
    ];
    const requestData3: SaveRoutineRequestDto = {
      routineName: routineName3,
      orderAndExercise: orderAndExercise3,
    };

    await request(app.getHttpServer()).post('/routines/').set('Authorization', `Bearer ${token}`).send(requestData3);

    const response = await request(app.getHttpServer())
      .delete('/routines/')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [1, 2] });
    expect(response.status).toBe(204);

    const queryResponse1 = await request(app.getHttpServer())
      .get('/routines/')
      .set('Authorization', `Bearer ${token}`)
      .query({ name: 'Leg routine' });
    expect(queryResponse1.status).toBe(404);

    const queryResponse2 = await request(app.getHttpServer())
      .get('/routines/')
      .set('Authorization', `Bearer ${token}`)
      .query({ name: 'Chest Day' });
    expect(queryResponse2.status).toBe(404);

    const queryResponse3 = await request(app.getHttpServer())
      .get('/routines/')
      .set('Authorization', `Bearer ${token}`)
      .query({ name: 'Back routine' });
    expect(queryResponse3.status).toBe(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
