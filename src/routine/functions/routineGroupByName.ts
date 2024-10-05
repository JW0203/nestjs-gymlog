import { GetAllRoutineByUserResponseDto } from '../dto/getAllRoutineByUser.response.dto';

export interface GroupedRoutine {
  name: string;
  exercises: {
    id: number;
    exerciseId: number;
    bodyPart: string;
    exerciseName: string;
    userId: number;
  }[];
}

interface GroupedData {
  [key: string]: GroupedRoutine;
}

export function routineGroupByName(data: GetAllRoutineByUserResponseDto[]): GroupedRoutine[] {
  // 초기값을 명시적으로 정의
  const initialGroupedData: GroupedData = {};

  const groupedData = data.reduce((group, current) => {
    const { name, id, exerciseId, bodyPart, exerciseName, userId } = current;

    if (!group[name]) {
      group[name] = {
        name: name,
        exercises: [],
      };
    }

    group[name].exercises.push({ id, exerciseId, bodyPart, exerciseName, userId });

    return group;
  }, initialGroupedData);

  return Object.values(groupedData);
}
