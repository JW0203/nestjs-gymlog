import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { BodyPart } from '../../common/bodyPart.enum';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { SaveExercisesRequestDto } from '../dto/saveExercises.request.dto';
import { clearAndResetTable } from '../../../test/utils/dbUtils';

describe('Exercise API (e2e)', () => {
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
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await clearAndResetTable(queryRunner, 'exercise');
    await queryRunner.release();
  });

  it('Given new exercises with body part and exercise name, When saving exercise, then then the response with status code should be 201.', async () => {
    const exerciseDataArray: ExerciseDataFormatDto[] = [
      { bodyPart: BodyPart.SHOULDERS, exerciseName: 'shoulder press' },
      { bodyPart: BodyPart.BACK, exerciseName: 'seated row ' },
    ];

    const newExercises: SaveExercisesRequestDto = {
      exercises: exerciseDataArray,
    };

    const response = await request(app.getHttpServer()).post('/exercises/').send(newExercises);

    expect(response.status).toBe(201);
  });

  it('Given saved exercise, when searching a exercise using body part and exercise name, then the response with status code should be and response body should contain the body part and exercise name used in the search', async () => {
    const exerciseDataArray: ExerciseDataFormatDto[] = [
      { bodyPart: BodyPart.SHOULDERS, exerciseName: 'shoulder press' },
    ];
    const exercises: SaveExercisesRequestDto = {
      exercises: exerciseDataArray,
    };
    await request(app.getHttpServer()).post('/exercises/').send(exercises);

    const response = await request(app.getHttpServer())
      .get('/exercises/')
      .query({ bodyPart: BodyPart.SHOULDERS, exerciseName: 'shoulder press' });

    expect(response.status).toBe(200);
    expect(response.body.bodyPart).toBe(BodyPart.SHOULDERS);
    expect(response.body.exerciseName).toBe('shoulder press');
  });

  it('Given 5 saved exercises, when searching all exercises, then the response with status should be 200 and the length of response body should be 5.', async () => {
    const exerciseData: ExerciseDataFormatDto[] = [
      { bodyPart: BodyPart.SHOULDERS, exerciseName: 'shoulder' },
      { bodyPart: BodyPart.BACK, exerciseName: 'back' },
      { bodyPart: BodyPart.ABS, exerciseName: 'abs' },
      { bodyPart: BodyPart.LEGS, exerciseName: 'legs' },
      { bodyPart: BodyPart.ARM, exerciseName: 'arm' },
    ];
    const givenExercises: SaveExercisesRequestDto = {
      exercises: exerciseData,
    };
    await request(app.getHttpServer()).post('/exercises/').send(givenExercises);

    const response = await request(app.getHttpServer()).get('/exercises/all/');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(5);
  });

  it('Given 2 saved exercises, when deleting 2 exercise using their ids, then the response with status should be 204.', async () => {
    const exerciseData: ExerciseDataFormatDto[] = [
      { bodyPart: BodyPart.LEGS, exerciseName: 'goblet squat' },
      { bodyPart: BodyPart.LEGS, exerciseName: 'lunge' },
    ];
    const newExercises: SaveExercisesRequestDto = {
      exercises: exerciseData,
    };
    await request(app.getHttpServer()).post('/exercises/').send(newExercises);
    const ids: number[] = [1, 2];

    const response = await request(app.getHttpServer()).delete('/exercises/').send({ ids });

    expect(response.status).toBe(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
