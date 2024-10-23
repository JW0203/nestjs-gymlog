import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { BodyPart } from '../../common/bodyPart.enum';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { SaveExercisesRequestDto } from '../dto/saveExercises.request.dto';

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

    //  단순히 exercise 테이블 초기화
    await queryRunner.query(`DELETE FROM exercise`);

    // AUTO_INCREMENT 값을 초기화
    await queryRunner.query(`ALTER TABLE exercise AUTO_INCREMENT = 1`);

    await queryRunner.release();
  });

  it('주어진 새로운 운동 부위와 이름을 저장을 성공하면 201 created 코드를 받아야한다.', async () => {
    // Given: 한가지 이상의 새로운 운동 이름과 운동부위
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

  it('저장된 exercise 중 하나를 운동부위와 운동이름을 이용하여 검색하면 200 Ok 코드를 받고 검색한 운동부위와 운동이름을 받는다.', async () => {
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

  it('저장된 5개의 운동을 검색하면 200 상태 코드와 5개의 운동 항목이 포함된 응답을 받아야 한다.', async () => {
    // Given : 저장된 운동들
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

    // When : 저장된 모둔 운동이름과 부위를 찾으려고 시도한다.
    const response = await request(app.getHttpServer()).get('/exercises/all/');
    // Then : 200 Ok 코드와 5개의 운동 항목이 포함된 응답을 받아야 한다.
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(5);
  });

  it('저장된 2개 exercises 의 id 를 이용하여 해당 exercises 삭제하면 204 No Content 코드를 받아야 한다.', async () => {
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
