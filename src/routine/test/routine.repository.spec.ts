import { RoutineRepository } from '../domain/routine.repository';
import { Routine } from '../domain/Routine.entity';
import { Exercise } from '../../exercise/domain/Exercise.entity';
import { BodyPart } from '../../common/bodyPart.enum';
import { User } from '../../user/domain/User.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { ROUTINE_REPOSITORY } from '../../common/const/inject.constant';
import { TypeormRoutineRepository } from '../infrastructure/typeormRoutine.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { getMySqlTypeOrmConfig } from '../../../test/utils/getMySql.TypeOrm.config';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { UpdateRoutine } from '../dto/updateRoutine.dto';
import { createTestUserRepo } from '../../../test/utils/createTestUser.repo.layer';
import { createTestRoutineRepo } from '../../../test/utils/createTestRoutine.repo.layer';
import { createTestExerciseRepo } from '../../../test/utils/createTestExercise.repo.layer';

describe('Test RoutineRepository', () => {
  let routineRepository: RoutineRepository;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(getMySqlTypeOrmConfig()), TypeOrmModule.forFeature([Routine, User, Exercise])],
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

  describe('saveRoutine', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });
    it('should save a routine', async () => {
      const user = await createTestUserRepo(dataSource);
      user.id = 1;
      const routineName = 'testRoutine';
      const newRoutine = new Routine({ name: routineName, user });

      const result = await routineRepository.saveRoutine(newRoutine);
      expect(result.user.id).toBe(user.id);
      expect(result.name).toBe(routineName);
      expect(result.id).toBe(1);
    });
  });

  describe('findOneRoutineByName', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('should return an empty array when a user searches for a non-existent routine name', async () => {
      const user: User = await createTestUserRepo(dataSource);
      const notExistRoutineName: string = 'back-routine';
      const result = await routineRepository.findOneRoutineByName(notExistRoutineName, user);

      expect(result).toBeNull();
    });

    it('should find routines saved by the user when a user searches for a routine name', async () => {
      const user: User = await createTestUserRepo(dataSource);
      const savedRoutine = await createTestRoutineRepo(dataSource, user);

      const result = await routineRepository.findOneRoutineByName(savedRoutine.name, user);

      expect(result).not.toBeNull();
      expect(result?.name).toBe(savedRoutine.name);
      expect(result?.user.id).toBe(user.id);
    });
  });

  describe('findOneRoutinesById', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('should find a routine saved by a user when a user searches for a routine id', async () => {
      const user: User = await createTestUserRepo(dataSource);
      const routines = await createTestRoutineRepo(dataSource, user);

      await routineRepository.saveRoutine(routines);

      const result = await routineRepository.findOneRoutineById(1, user);
      const findOneQueryResult = await dataSource
        .getRepository(Routine)
        .findOne({ where: { id: 1, user: { id: 1 } }, relations: ['user'] });

      expect(result).toStrictEqual(findOneQueryResult);
    });

    it('should return null when a user searches for a non-existent routine id', async () => {
      const user: User = await createTestUserRepo(dataSource);

      const result = await routineRepository.findOneRoutineById(999, user);
      const findOneQueryResult = await dataSource
        .getRepository(Routine)
        .findOne({ where: { id: 999, user: { id: 1 } }, relations: ['user'] });
      expect(result).toEqual(null);
      expect(result).toStrictEqual(findOneQueryResult);
    });
  });

  /*
  describe('updateRoutine', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('should return an updated routine when a user update a routine', async () => {
      const user: User = await createTestUserRepo(dataSource);
      // const exerciseInfo: ExerciseDataFormatDto[] = [
      //   { exerciseName: 'Push-up', bodyPart: BodyPart.CHEST },
      //   { exerciseName: 'Pull-up', bodyPart: BodyPart.BACK },
      //   { exerciseName: '', bodyPart: BodyPart.LEGS },
      // ];
      // const Exercises = await createTestExerciseRepo(dataSource);
      const Routines = await createTestRoutineRepo(dataSource, user);
      await routineRepository.saveRoutine(Routines);

      const existenceRoutines = await dataSource
        .getRepository(Routine)
        .find({ where: { id: 1, user: { id: 1 } }, relations: ['user'] });

      const givenUpdateDataArray: UpdateRoutine[] = [
        {
          order: 1,
          exerciseName: 'deadlift',
          bodyPart: BodyPart.LEGS,
        },
        {
          order: 2,
          exerciseName: 'goblet squat',
          bodyPart: BodyPart.LEGS,
        },
        {
          order: 3,
          exerciseName: 'barbell sumo squat',
          bodyPart: BodyPart.LEGS,
        },
      ];

      const updatedRoutines = await Promise.all(
        existenceRoutines.map(async (routine: Routine, i) => {
          const updateData = givenUpdateDataArray[i];
          const { order, exerciseName, bodyPart } = updateData;
          const exercise = await createExercise(dataSource, { exerciseName, bodyPart });
          if (id === routine.id) {
            routine.update({
              name: routineName,
              exercise,
              user,
            });
          }
          return routine;
        }),
      );

      const result = await routineRepository.updateRoutine(updatedRoutines);

      const findQueryResult = await dataSource
        .getRepository(Routine)
        .find({ where: { id: In([1, 2, 3]) }, relations: ['user', 'exercise'] });
      expect(result).toStrictEqual(findQueryResult);
    });
  });

  describe('softDeleteRoutines', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('should soft delete routines when user delete routines with their ids', async () => {
      const user: User = await createTestUserRepo(dataSource);
      const exerciseInfo: ExerciseDataFormatDto[] = [
        { exerciseName: 'Push-up', bodyPart: BodyPart.CHEST },
        { exerciseName: 'Pull-up', bodyPart: BodyPart.BACK },
      ];
      const Exercises = await createExercises(dataSource, exerciseInfo);
      const Routines: Routine = createTestRoutineRepo(dataSource, user);
      await routineRepository.saveRoutine(Routines);

      const result = await routineRepository.softDeleteRoutines([1, 2]);
      const findQueryResult = await dataSource.getRepository(Routine).find({ where: { id: In([1, 2]) } });
      const findOneWithDeletedQueryResult = await dataSource
        .getRepository(Routine)
        .find({ where: { id: In([1, 2]) }, withDeleted: true });

      expect(result).toBe(undefined);
      expect(findQueryResult.length).toBe(0);
      expect(findOneWithDeletedQueryResult.length).toBe(2);
      expect(findOneWithDeletedQueryResult).not.toBeNull();
    });
  });

  describe('findAllByUserId', () => {
    beforeEach(async () => {
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();

      await queryRunner.query('DELETE FROM routine');
      await queryRunner.query('DELETE FROM user');
      await queryRunner.query('DELETE FROM exercise');

      await queryRunner.release();
    });

    it('should return all routines saved by a user when a user find their routines with their id', async () => {
      const user: User = await createTestUserRepo(dataSource);
      const exerciseInfo: ExerciseDataFormatDto[] = [
        { exerciseName: 'Push-up', bodyPart: BodyPart.CHEST },
        { exerciseName: 'Pull-up', bodyPart: BodyPart.BACK },
      ];
      const Exercises = await createTestExerciseRepo(dataSource);
      const Routines = await createTestRoutineRepo(dataSource, user);
      await routineRepository.saveRoutine(Routines);

      const result = await routineRepository.findAllByUserId(user.id);
      const findQueryResult = await dataSource
        .getRepository(Routine)
        .find({ where: { user: { id: user.id } }, relations: ['user', 'exercise'] });

      expect(result).toStrictEqual(findQueryResult);
    });

    it('should return all routines save by a user when a user find using findAllByUserId', async () => {
      const user: User = await createTestUserRepo(dataSource);

      const result = await routineRepository.findAllByUserId(user.id);
      const findQueryResult = await dataSource
        .getRepository(Routine)
        .find({ where: { user: { id: user.id } }, relations: ['user', 'exercise'] });

      expect(result).toStrictEqual(findQueryResult);
    });

    afterAll(async () => {
      await dataSource.destroy();
    });
  });

 */
});
