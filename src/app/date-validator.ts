import { AbstractControl, ValidatorFn } from '@angular/forms';

export function dateValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    const value = control.value;
    
    // Verifica si el valor es una cadena y si coincide con el formato dd-MM-yyyy
    const regex = /^\d{2}-\d{2}-\d{4}$/;
    if (!regex.test(value)) {
      return { 'invalidDateFormat': 'La fecha debe estar en el formato dd-MM-yyyy' };
    }

    // Descompone la fecha en día, mes y año
    const [day, month, year] = value.split('-').map((num: string) => parseInt(num, 10));

    // Verifica que los valores numéricos sean válidos
    const date = new Date(year, month - 1, day);
    const isValidDate = (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );

    // Retorna un error si la fecha no es válida
    return isValidDate ? null : { 'invalidDate': 'Fecha no válida' };
  };
}