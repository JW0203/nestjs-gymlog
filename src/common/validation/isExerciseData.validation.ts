import { BodyPart } from '../bodyPart.enum';
import { ExerciseDataFormatDto } from '../dto/exerciseData.format.dto';

function isBodyPartValid(bodyPart: string): { isValid: boolean; error?: string } {
  const allParts: string[] = Object.values(BodyPart);
  if (!allParts.includes(bodyPart)) {
    return { isValid: false, error: `Invalid body part '${bodyPart}'` };
  }
  return { isValid: true };
}

function isExerciseNameValid(exerciseName: string): { isValid: boolean; error?: string } {
  const minLength: number = 2;
  const maxLength: number = 50;
  const pattern = /^[a-zA-Z0-9\uAC00-\uD7A3\s]*$/;

  if (exerciseName.length < minLength || exerciseName.length > maxLength) {
    return { isValid: false, error: `Invalid length for exercise name '${exerciseName}'` };
  }
  if (!pattern.test(exerciseName)) {
    return { isValid: false, error: `Invalid pattern for exercise name '${exerciseName}'` };
  }
  return { isValid: true };
}

export function isExerciseDataArrayValidation(exercisesData: ExerciseDataFormatDto[]) {
  const errors: string[] = [];
  exercisesData.forEach((exercise) => {
    const bodyPartValidation = isBodyPartValid(exercise.bodyPart);
    const exerciseNameValidation = isExerciseNameValid(exercise.exerciseName);

    if (bodyPartValidation.error) {
      errors.push(bodyPartValidation.error);
    }
    if (exerciseNameValidation.error) {
      errors.push(exerciseNameValidation.error);
    }
  });
  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true };
}
