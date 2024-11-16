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
    // Given
    const exerciseDataArray: ExerciseDataFormatDto[] = [
      { bodyPart: BodyPart.SHOULDERS, exerciseName: '숄더프레스' },
      { bodyPart: BodyPart.BACK, exerciseName: '시티드 로우' },
    ];

    const newExercises: SaveExercisesRequestDto = {
      exercises: exerciseDataArray,
    };

    // When: 저장하려고 시도한다.
    const response = await request(app.getHttpServer()).post('/exercises/').send(newExercises);

    // Then:  201 Created 코드를 받아야 한다.
    expect(response.status).toBe(201);
  });

  it('Given saved exercise, when searching a exercise using body part and exercise name, then the response with status code should be and response body should contain the body part and exercise name used in the search', async () => {
    // Given: 저장된 exercise
    const exerciseDataArray: ExerciseDataFormatDto[] = [{ bodyPart: BodyPart.SHOULDERS, exerciseName: '숄더프레스' }];
    const exercises: SaveExercisesRequestDto = {
      exercises: exerciseDataArray,
    };
    await request(app.getHttpServer()).post('/exercises/').send(exercises);

    // When: 운동부위와 운동이름을 이용하여 검색을 한다.
    const response = await request(app.getHttpServer())
      .get('/exercises/')
      .query({ bodyPart: BodyPart.SHOULDERS, exerciseName: '숄더프레스' });
    // Then:  200 Ok 코드를 받는다.
    expect(response.status).toBe(200);
    expect(response.body.bodyPart).toBe(BodyPart.SHOULDERS);
    expect(response.body.exerciseName).toBe('숄더프레스');
  });

  it('Given 5 saved exercises, when searching all exercises, then the response with status should be 200 and the length of response body should be 5.', async () => {
    // Given :
    const exerciseData: ExerciseDataFormatDto[] = [
      { bodyPart: BodyPart.SHOULDERS, exerciseName: '어깨' },
      { bodyPart: BodyPart.BACK, exerciseName: '등' },
      { bodyPart: BodyPart.ABS, exerciseName: '복근' },
      { bodyPart: BodyPart.LEGS, exerciseName: '다리' },
      { bodyPart: BodyPart.ARM, exerciseName: '팔' },
    ];
    const givenExercises: SaveExercisesRequestDto = {
      exercises: exerciseData,
    };
    await request(app.getHttpServer()).post('/exercises/').send(givenExercises);

    // When
    const response = await request(app.getHttpServer()).get('/exercises/all/');
    // Then
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(5);
  });

  it('Given 2 saved exercises, when deleting 2 exercise using their ids, then the response with status should be 204.', async () => {
    // Given: 저장된 2개 exercises 의 ids
    const exerciseData: ExerciseDataFormatDto[] = [
      { bodyPart: BodyPart.LEGS, exerciseName: '고블린스퀏트' },
      { bodyPart: BodyPart.LEGS, exerciseName: '런지' },
    ];
    const newExercises: SaveExercisesRequestDto = {
      exercises: exerciseData,
    };
    await request(app.getHttpServer()).post('/exercises/').send(newExercises);
    const ids: number[] = [1, 2];

    // When: 아이디를 이용해서 지우려고 시도한다.
    const response = await request(app.getHttpServer()).delete('/exercises/').send({ ids });

    // Then: 204 No Content 코드를 받아야 한다.
    expect(response.status).toBe(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
