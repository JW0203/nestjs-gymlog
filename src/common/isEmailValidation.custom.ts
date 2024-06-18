import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
class IsCustomEmailConstraint implements ValidatorConstraintInterface {
  validate(email: string, args: ValidationArguments) {
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(email)) {
      args.constraints[0] = 'invalidFormat';
      return false;
    }

    const specialChars = /[!#$%&'*+/=?^_`{|}~-]/;
    const localPart = email.split('@')[0];

    // Check if the first or last character is a special character
    if (specialChars.test(localPart[0]) || specialChars.test(localPart[localPart.length - 1])) {
      args.constraints[0] = 'specialCharFirstOrLast';
      return false;
    }

    // Check for consecutive special characters
    for (let i = 0; i < localPart.length - 1; i++) {
      if (specialChars.test(localPart[i]) && specialChars.test(localPart[i + 1])) {
        args.constraints[0] = 'consecutiveSpecialChars';
        return false;
      }
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const failureReason = args.constraints[0];
    switch (failureReason) {
      case 'invalidFormat':
        return 'Email format is invalid. It must follow the standard email format (e.g., user@example.com).';
      case 'specialCharFirstOrLast':
        return 'Email is not valid. A special character cannot appear as the first or last character in an email address.';
      case 'consecutiveSpecialChars':
        return 'Email is not valid. Special characters cannot appear consecutively two or more times in an email address.';
      default:
        return 'Email is not valid.';
    }
  }
}

export function IsEmailCustom(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCustomEmailConstraint,
    });
  };
}
