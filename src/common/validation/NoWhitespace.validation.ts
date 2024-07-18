import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class NoWhitespaceConstraint implements ValidatorConstraintInterface {
  validate(text: string) {
    if (/\s/.test(text)) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return 'Must not contain any whitespace characters';
  }
}

export function NoWhitespace(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: NoWhitespaceConstraint,
    });
  };
}
