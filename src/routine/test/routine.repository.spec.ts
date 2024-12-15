import { RoutineRepository } from '../domain/routine.repository';
import { Routine } from '../domain/Routine.entity';
import { Exercise } from '../../exercise/domain/Exercise.entity';
import { BodyPart } from '../../common/bodyPart.enum';
import { User } from '../../user/domain/User.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { ROUTINE_REPOSITORY } from '../../common/const/inject.constant';
import { TypeormRoutineRepository } from '../infrastructure/typeormRoutine.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutLog } from '../../workoutLog/domain/WorkoutLog.entity';
import { DataSource, In } from 'typeorm';
import { getMySqlTypeOrmConfig } from '../../../test/utils/getMySql.TypeOrm.config';
import { TEST_USER } from '../../../test/utils/userUtils';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { UpdateRoutine } from '../dto/updateRoutine.format.dto';

function createRoutines(user: User, exercises: Exercise[], routineName: string) {
  return exercises.map((exercise) => {
    return new Routine({
      name: routineName,
      user,
      exercise,
    });
  });
}

async function createMockUser(dataSource: DataSource, userInfo: TEST_USER) {
  const userRepository = dataSource.getRepository(User);
  const user = userRepository.create(userInfo);

  return await userRepository.save(user);
}

async function createMockExercise(dataSource: DataSource, exercise: ExerciseDataFormatDto) {
  const exerciseRepository = dataSource.getRepository(Exercise);
  const exerciseEntity = exerciseRepository.create(exercise);
  return await exerciseRepository.save(exerciseEntity);
}

async function createMockExercises(dataSource: DataSource, exercises: ExerciseDataFormatDto[]) {
  const exerciseRepository = dataSource.getRepository(Exercise);
  const exerciseEntities = exercises.map((exercise) => {
    return exerciseRepository.create(exercise);
  });
  return await exerciseRepository.save(exerciseEntities);
}

describe('Test RoutineRepository', () => {
  let routineRepository: RoutineRepository;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(getMySqlTypeOrmConfig([Routine, User, Exercise, WorkoutLog])),
        TypeOrmModule.forFeature([Routine, User, Exercise]),
      ],
      providers: [
        {
          provide: ROUTINE_REPOSITORY,
          useClass: TypeormRoutineRepository,
        },
      ],
    }).compile();
    routineRepository = module.get<RoutineRepository>(ROUTINE_REPOSITORY);
    dataSource = module.get<DataSource>(DataSource);
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  beforeEach(async () => {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.query('DELETE FROM routine');
    await queryRunner.query('DELETE FROM user');
    await queryRunner.query('DELETE FROM exercise');

    await queryRunner.release();
  });

  it('should save new routines for a user at once using bulkInsertRoutines', async () => {
    const mockUser: User = await createMockUser(dataSource, {
      email: 'testuser@email.com',
      password: '123456',
      name: 'Test User',
    });
    const exerciseInfo: ExerciseDataFormatDto[] = [
      { exerciseName: 'Push-up', bodyPart: BodyPart.CHEST },
      { exerciseName: 'Pull-up', bodyPart: BodyPart.BACK },
    ];
    const mockExercises = await createMockExercises(dataSource, exerciseInfo);

    const routineName = '다리 루틴';
    const routines = createRoutines(mockUser, mockExercises, routineName);

    const result = await routineRepository.bulkInsertRoutines(routines);
    const savedResult = await dataSource
      .getRepository(Routine)
      .find({ where: { name: routineName }, relations: ['user', 'exercise'] });

    expect(result).toStrictEqual(savedResult);
    expect(result.length).toBe(2);
  });

  it('should return an empty array when a user searches for a non-existent routine name using findRoutinesByName', async () => {
    const mockUser: User = await createMockUser(dataSource, {
      email: 'testuser@email.com',
      password: '123456',
      name: 'Test User',
    });

    const notExistRoutineName: string = '등데이';
    const result = await routineRepository.findRoutinesByName(notExistRoutineName, mockUser);

    const findQueryResult = await dataSource
      .getRepository(Routine)
      .find({ where: { name: notExistRoutineName, user: { id: 1 } }, relations: ['user', 'exercise'] });
    expect(result).toEqual([]);
    expect(result).toStrictEqual(findQueryResult);
  });

  it('should find routines saved by the user when a user searches for a routine name using findRoutinesByName', async () => {
    const mockUser: User = await createMockUser(dataSource, {
      email: 'testuser@email.com',
      password: '123456',
      name: 'Test User',
    });
    const exerciseInfo: ExerciseDataFormatDto[] = [
      { exerciseName: 'Push-up', bodyPart: BodyPart.CHEST },
      { exerciseName: 'Pull-up', bodyPart: BodyPart.BACK },
    ];
    const mockExercises = await createMockExercises(dataSource, exerciseInfo);

    const routineName = '다리 루틴';
    const routines = createRoutines(mockUser, mockExercises, routineName);
    await routineRepository.bulkInsertRoutines(routines);

    const result = await routineRepository.findRoutinesByName(routineName, mockUser);

    const findQueryResult = await dataSource
      .getRepository(Routine)
      .find({ where: { name: routineName }, relations: ['user', 'exercise'] });
    expect(result.length).toBe(2);
    expect(result).toStrictEqual(findQueryResult);
  });

  it('should find a routine saved by a user when a user searches for a routine id using findOneRoutinesById', async () => {
    const mockUser: User = await createMockUser(dataSource, {
      email: 'testuser@email.com',
      password: '123456',
      name: 'Test User',
    });
    const exerciseInfo: ExerciseDataFormatDto[] = [{ exerciseName: 'Push-up', bodyPart: BodyPart.CHEST }];
    const mockExercise = await createMockExercises(dataSource, exerciseInfo);
    const routineName = '다리 루틴';
    const routines = createRoutines(mockUser, mockExercise, routineName);

    await routineRepository.bulkInsertRoutines(routines);

    const result = await routineRepository.findOneRoutineById(1, mockUser);
    const findOneQueryResult = await dataSource
      .getRepository(Routine)
      .findOne({ where: { id: 1, user: { id: 1 } }, relations: ['user', 'exercise'] });

    expect(result).toStrictEqual(findOneQueryResult);
  });

  it('should return null when a user searches for a non-existent routine id using findOneRoutineById', async () => {
    const mockUser: User = await createMockUser(dataSource, {
      email: 'testuser@email.com',
      password: '123456',
      name: 'Test User',
    });

    const result = await routineRepository.findOneRoutineById(999, mockUser);
    const findOneQueryResult = await dataSource
      .getRepository(Routine)
      .findOne({ where: { id: 999, user: { id: 1 } }, relations: ['user', 'exercise'] });
    expect(result).toEqual(null);
    expect(result).toStrictEqual(findOneQueryResult);
  });

  it('should return all routines when a user searches for routine ids using findRoutinesByIds', async () => {
    const mockUser: User = await createMockUser(dataSource, {
      email: 'testuser@email.com',
      password: '123456',
      name: 'Test User',
    });

    const exerciseInfo: ExerciseDataFormatDto[] = [
      { exerciseName: 'Push-up', bodyPart: BodyPart.CHEST },
      { exerciseName: 'Pull-up', bodyPart: BodyPart.BACK },
      { exerciseName: '', bodyPart: BodyPart.LEGS },
    ];
    const mockExercises = await createMockExercises(dataSource, exerciseInfo);
    const mockRoutines = createRoutines(mockUser, mockExercises, 'all routine');
    await routineRepository.bulkInsertRoutines(mockRoutines);

    const result = await routineRepository.findRoutinesByIds([1, 2, 3], mockUser);
    const findQueryResult = await dataSource
      .getRepository(Routine)
      .find({ where: { id: In([1, 2, 3]), user: { id: 1 } }, relations: ['user', 'exercise'] });

    expect(result).toStrictEqual(findQueryResult);
  });

  it('should return 2 routines when a user searches for 2 routine ids using findRoutinesByIds', async () => {
    const mockUser: User = await createMockUser(dataSource, {
      email: 'testuser@email.com',
      password: '123456',
      name: 'Test User',
    });

    const exerciseInfo: ExerciseDataFormatDto[] = [
      { exerciseName: 'Push-up', bodyPart: BodyPart.CHEST },
      { exerciseName: 'Pull-up', bodyPart: BodyPart.BACK },
      { exerciseName: '', bodyPart: BodyPart.LEGS },
    ];
    const mockExercises = await createMockExercises(dataSource, exerciseInfo);
    const mockRoutines = createRoutines(mockUser, mockExercises, 'all routine');
    await routineRepository.bulkInsertRoutines(mockRoutines);

    const result = await routineRepository.findRoutinesByIds([1, 2], mockUser);
    const findQueryResult = await dataSource
      .getRepository(Routine)
      .find({ where: { id: In([1, 2]), user: { id: 1 } }, relations: ['user', 'exercise'] });

    expect(result).toStrictEqual(findQueryResult);
  });

  it('should return only existence routines when a user searches for routine ids using findRoutinesByIds', async () => {
    const mockUser: User = await createMockUser(dataSource, {
      email: 'testuser@email.com',
      password: '123456',
      name: 'Test User',
    });

    const exerciseInfo: ExerciseDataFormatDto[] = [
      { exerciseName: 'Push-up', bodyPart: BodyPart.CHEST },
      { exerciseName: 'Pull-up', bodyPart: BodyPart.BACK },
      { exerciseName: '', bodyPart: BodyPart.LEGS },
    ];
    const mockExercises = await createMockExercises(dataSource, exerciseInfo);
    const mockRoutines = createRoutines(mockUser, mockExercises, 'all routine');
    await routineRepository.bulkInsertRoutines(mockRoutines);

    const result = await routineRepository.findRoutinesByIds([1, 2, 999], mockUser);
    const findQueryResult = await dataSource
      .getRepository(Routine)
      .find({ where: { id: In([1, 2, 999]), user: { id: 1 } }, relations: ['user', 'exercise'] });

    expect(result).toStrictEqual(findQueryResult);
  });

  it('should return an empty array when a user searches for non-existence routine ids using findRoutinesByIds', async () => {
    const mockUser: User = await createMockUser(dataSource, {
      email: 'testuser@email.com',
      password: '123456',
      name: 'Test User',
    });

    const result = await routineRepository.findRoutinesByIds([1000, 102, 999], mockUser);
    const findQueryResult = await dataSource
      .getRepository(Routine)
      .find({ where: { id: In([1000, 102, 999]), user: { id: 1 } }, relations: ['user', 'exercise'] });

    expect(result).toStrictEqual(findQueryResult);
  });

  it('should return updated routines when a user update routines using bulkUpdateRoutines', async () => {
    const mockUser: User = await createMockUser(dataSource, {
      email: 'testuser@email.com',
      password: '123456',
      name: 'Test User',
    });
    const exerciseInfo: ExerciseDataFormatDto[] = [
      { exerciseName: 'Push-up', bodyPart: BodyPart.CHEST },
      { exerciseName: 'Pull-up', bodyPart: BodyPart.BACK },
      { exerciseName: '', bodyPart: BodyPart.LEGS },
    ];
    const mockExercises = await createMockExercises(dataSource, exerciseInfo);
    const mockRoutines: Routine[] = createRoutines(mockUser, mockExercises, 'testroutine');
    await routineRepository.bulkInsertRoutines(mockRoutines);

    const existenceRoutines = await dataSource
      .getRepository(Routine)
      .find({ where: { id: In([1, 2, 3]), user: { id: 1 } }, relations: ['user', 'exercise'] });

    const givenUpdateDataArray: UpdateRoutine[] = [
      {
        id: 1,
        routineName: 'Leg days',
        exerciseName: 'deadlift',
        bodyPart: BodyPart.LEGS,
      },
      {
        id: 2,
        routineName: 'Leg days',
        exerciseName: 'goblet squat',
        bodyPart: BodyPart.LEGS,
      },
      {
        id: 3,
        routineName: 'Leg days',
        exerciseName: 'barbell sumo squat',
        bodyPart: BodyPart.LEGS,
      },
    ];

    const updatedRoutines = await Promise.all(
      existenceRoutines.map(async (routine: Routine, i) => {
        const updateData = givenUpdateDataArray[i];
        const { id, routineName, exerciseName, bodyPart } = updateData;
        const exercise = await createMockExercise(dataSource, { exerciseName, bodyPart });
        if (id === routine.id) {
          routine.update({
            name: routineName,
            exercise,
            user: mockUser,
          });
        }
        return routine;
      }),
    );

    const result = await routineRepository.bulkUpdateRoutines(updatedRoutines);

    const findQueryResult = await dataSource
      .getRepository(Routine)
      .find({ where: { id: In([1, 2, 3]) }, relations: ['user', 'exercise'] });
    expect(result).toStrictEqual(findQueryResult);
  });

  it('should soft delete routines when user delete routines with their ids using softDeleteRoutines', async () => {
    const mockUser: User = await createMockUser(dataSource, {
      email: 'testuser@email.com',
      password: '123456',
      name: 'Test User',
    });
    const exerciseInfo: ExerciseDataFormatDto[] = [
      { exerciseName: 'Push-up', bodyPart: BodyPart.CHEST },
      { exerciseName: 'Pull-up', bodyPart: BodyPart.BACK },
    ];
    const mockExercises = await createMockExercises(dataSource, exerciseInfo);
    const mockRoutines: Routine[] = createRoutines(mockUser, mockExercises, 'testroutine');
    await routineRepository.bulkInsertRoutines(mockRoutines);

    const result = await routineRepository.softDeleteRoutines([1, 2]);
    const findQueryResult = await dataSource.getRepository(Routine).find({ where: { id: In([1, 2]) } });

    expect(result).toBe(undefined);
    expect(findQueryResult.length).toBe(0);
  });

  it('should return all routines saved by a user when a user find their routines with their id using findAllByUserId', async () => {
    const mockUser: User = await createMockUser(dataSource, {
      email: 'testuser@email.com',
      password: '123456',
      name: 'Test User',
    });
    const exerciseInfo: ExerciseDataFormatDto[] = [
      { exerciseName: 'Push-up', bodyPart: BodyPart.CHEST },
      { exerciseName: 'Pull-up', bodyPart: BodyPart.BACK },
    ];
    const mockExercises = await createMockExercises(dataSource, exerciseInfo);
    const mockRoutines: Routine[] = createRoutines(mockUser, mockExercises, 'testroutine');
    await routineRepository.bulkInsertRoutines(mockRoutines);

    const result = await routineRepository.findAllByUserId(mockUser.id);
    const findQueryResult = await dataSource
      .getRepository(Routine)
      .find({ where: { user: { id: mockUser.id } }, relations: ['user', 'exercise'] });

    expect(result).toStrictEqual(findQueryResult);
  });

  it('should return all routines save by a user when a user find using findAllByUserId', async () => {
    const mockUser: User = await createMockUser(dataSource, {
      email: 'testuser@email.com',
      password: '123456',
      name: 'Test User',
    });

    const result = await routineRepository.findAllByUserId(mockUser.id);
    const findQueryResult = await dataSource
      .getRepository(Routine)
      .find({ where: { user: { id: mockUser.id } }, relations: ['user', 'exercise'] });

    expect(result).toStrictEqual(findQueryResult);
  });
  afterEach(async () => {
    await dataSource.destroy();
  });
});
