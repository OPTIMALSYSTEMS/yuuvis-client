import { AbstractControl } from '@angular/forms';

export const hasRequiredField = (abstractControl: AbstractControl): boolean => {
  const controls = 'controls';

  console.log({ abstractControl });
  if (abstractControl.validator) {
    console.log(abstractControl.validator({} as AbstractControl));
    const validator = abstractControl.validator({} as AbstractControl);

    if (validator && validator.required) {
      return true;
    }
  }
  if (abstractControl[controls]) {
    for (const controlName in abstractControl[controls]) {
      if (abstractControl[controls][controlName]) {
        if (hasRequiredField(abstractControl[controls][controlName])) {
          return true;
        }
      }
    }
  }
  return false;
};
