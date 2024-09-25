import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ExerciseDataFormatDto } from '../src/common/dto/exerciseData.format.dto';
import { SaveExercisesRequestDto } from '../src/excercise/dto/saveExercises.request.dto';
import { SaveWorkoutLogsRequestDto } from '../src/workoutLog/dto/saveWorkoutLogs.request.dto';
import { SaveRoutinesRequestDto } from '../src/routine/dto/saveRoutines.request.dto';
import { SignUpRequestDto } from '../src/user/dto/signUp.request.dto';
import { SignInRequestDto } from '../src/user/dto/signIn.request.dto';

const gymLogService = {
  signUp(app: INestApplication, userinfo: SignUpRequestDto) {
    return request(app.getHttpServer()).post('/users').send(userinfo);
  },

  signIn(app: INestApplication, userinfo: SignUpRequestDto) {
    const signedUpUser: SignInRequestDto = { email: userinfo.email, password: userinfo.password };
    return request(app.getHttpServer()).get('/users/').send(signedUpUser);
  },

  postExercises(app: INestApplication, exercisesData: SaveExercisesRequestDto) {
    return request(app.getHttpServer()).post('/exercises/').send(exercisesData);
  },

  getExercise(app: INestApplication, exercise: ExerciseDataFormatDto) {
    return request(app.getHttpServer()).get('/exercises/').send(exercise);
  },

  postWorkoutLogs(app: INestApplication, workoutLogs: SaveWorkoutLogsRequestDto, token: string) {
    return request(app.getHttpServer()).post('/workout-logs').set('Authorization', `Bearer ${token}`).send(workoutLogs);
  },

  getWorkoutLogsOnDate(app: INestApplication, date: string, token: string) {
    return request(app.getHttpServer()).get('/workout-logs/').query({ date }).set('Authorization', `Bearer ${token}`);
  },

  postRoutine(app: INestApplication, token: string, routine: SaveRoutinesRequestDto) {
    return request(app.getHttpServer()).post('/routines/').set('Authorization', `Bearer ${token}`).send(routine);
  },
};

export default gymLogService;
