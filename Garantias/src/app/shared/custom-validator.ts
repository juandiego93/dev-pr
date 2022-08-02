import { AbstractControl, ValidationErrors } from '@angular/forms';

export function numeric(control: AbstractControl) {
  let val = control.value;

  if (val === null || val === '' || val === undefined) return null;

  if (!val.toString().match(/^[0-9]+(\.?[0-9]+)?$/)) return { 'invalidNumber': true };

  return null;
}

export function cellphone(control: AbstractControl) {
  let val = control.value;

  if (val === null || val === '') return null;

  if (val.charAt(0) !== '3') {return { 'invalidCellphone': true }} else {return  null };

  return null;
}
export function alphaNumeric(control: AbstractControl) {
  let val = control.value;

  if (val === null || val === '') return null;

  if (!val.toString().match(/^[a-zA-Z0-9]+$/)) return { 'invalidAlphaNumeric': true };

  return null;
}


export function validLength(data: Array<number>): ValidatorFn {

  return (control: AbstractControl): ValidationErrors | null => {

    let noLength = false;

    let val = control.value;

    if (val === null || val === '') return null;

    data.forEach((item, index) => {
      if (val.toString().length == item) {
        noLength = true;
      }
    });


    if (noLength == false) {
      return { 'invalidLength': true };
    }

    return null;

  }

}

export function validateName(control: AbstractControl) {
  if (control.value !== null) {
    const nombre = control.value.toLowerCase();
    const buscarTitular = nombre.indexOf('titular');
    const buscarTt = nombre.indexOf('tt');
    const buscarDosEspacios = nombre.indexOf('  ');

    if (nombre === null || nombre === ' ') return { 'required': true };

    if (buscarTt !== -1) {
      return { 'invalidNamett': true }

    } else if (buscarTitular !== -1) {
      return { 'invalidNameTitular': true }

    } else if (buscarDosEspacios !== -1) {
      return { 'invalidNameDubleSpace': true }

    } else if (nombre.length >= 3) {
      const miArray = Array.from(nombre);
      const tamano = (miArray.length);
      for (let i = 0; i < tamano; i++) {
        if (miArray[i] === miArray[i + 1] && miArray[i + 1] === miArray[i + 2]) {
          return { 'invalidName3Letters': true }
        }
      }
    } else if (nombre.length > 0 && nombre.length <= 3) {
      return { 'invalidNameLength': true }

    } else {
      return null
    }
  }
  else {
    return null
  }
}


export function allowedChar(control: AbstractControl) {
  const val = control.value;
  if (val === null || val === '') return null;
  if (!val.toString().match(/^[a-zA-Z][a-zA-Z\s\u00C0-\u00FF]*$/))
  {return { 'invalidChar': true }} else {return  null };
}

export function allowedEmail(control: AbstractControl) {
  const val = control.value;
  if (val === null || val === '') { return null };
  if (!/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(val)) {
    return { invalidEmail: true }} else { return null };
}

interface ValidatorFn {
  (control: AbstractControl): ValidationErrors | null
}
