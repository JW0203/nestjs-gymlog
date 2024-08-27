import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { sign } from 'jsonwebtoken';
import { DataSource } from 'typeorm';

function generateTestToken(): string {
  const payload = { id: 1 };
  return sign(payload, process.env.JWT_SECRET || 'mykey', { expiresIn: '1h' });
}

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
      return request(app.getHttpServer())
        .post('/users/')
        .send({
          email: 'test1@email.com',
          password: '12345678',
          name: 'Tester',
        })
        .expect(201);
    });

    it('user sign in', () => {
      return request(app.getHttpServer())
        .get('/users/')
        .send({
          email: 'test1@email.com',
          password: '12345678',
        })
        .expect(200);
    });

    it('my information', () => {
      return request(app.getHttpServer()).get('/users/my/').set('Authorization', `Bearer ${token}`).expect(200);
    });

    it('Delete my account', () => {
      return request(app.getHttpServer()).delete('/users/').set('Authorization', `Bearer ${token}`).expect(204);
    });
  });

  describe('Test exercise API', () => {
    it('save exercises at once', () => {
      return request(app.getHttpServer())
        .post('/exercises/')
        .send({
          exercises: [
            { bodyPart: 'Shoulders', exerciseName: '숄더프레스' },
            { bodyPart: 'Shoulders', exerciseName: '업라이트로우' },
            { bodyPart: 'Shoulders', exerciseName: '사레레' },
          ],
        })
        .expect(201);
    });

    it('find One exercise using name and body part', () => {
      return request(app.getHttpServer())
        .get('/exercises/')
        .send({
          exerciseName: '숄더프레스',
          bodyPart: 'Shoulders',
        })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  it('find all exercises', () => {
    return request(app.getHttpServer()).get('/exercises/all').set('Authorization', `Bearer ${token}`).expect(200);
  });

  it('delete exercises', () => {
    return request(app.getHttpServer())
      .delete('/exercises/')
      .send({
        ids: [1],
      })
      .expect(204);
  });
});
