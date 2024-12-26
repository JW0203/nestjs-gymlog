import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
class IsExerciseNameValidation implements ValidatorConstraintInterface {
  validate(exerciseName: any, args: ValidationArguments) {
    if (typeof exerciseName !== 'string') {
      args.constraints[0] = 'Invalid type';
      return false;
    }
    if (exerciseName.length < 2 || exerciseName.length > 50) {
      args.constraints[0] = 'Invalid length';
      return false;
    }
    const allowPattern = /^[a-zA-Z\uAC00-\uD7A3][a-zA-Z0-9\uAC00-\uD7A3\s]*[a-zA-Z0-9\uAC00-\uD7A3]$/;
    const matchedPattern = allowPattern.test(exerciseName);
    if (!matchedPattern) {
      args.constraints[0] = 'Invalid pattern';
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const failureReason = args.constraints[0];
    switch (failureReason) {
      case 'Invalid type':
        return 'Type of ExerciseName is invalid. It must be string.';
      case 'Invalid length':
        return 'Exercise name must be between 3 and 50 characters';
      case 'Invalid pattern':
        return 'Exercise name can not contain Special characters';
      default:
        return 'ExerciseName is not valid.';
    }
  }
}

export function IsExerciseName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsExerciseNameValidation,
    });
  };
}
