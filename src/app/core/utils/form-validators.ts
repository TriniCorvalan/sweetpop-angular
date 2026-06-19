import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function usernameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const trimmed = control.value?.trim() ?? '';
    if (trimmed.length < 6 || trimmed.length > 20) {
      return { invalidUsername: true };
    }
    return /^[a-zA-Z0-9._-]+$/.test(trimmed) ? null : { invalidUsername: true };
  };
}

export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(control.value?.trim() ?? '') ? null : { invalidEmail: true };
}

export function birthdateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const birthdate = new Date(control.value ?? '');
    if (Number.isNaN(birthdate.getTime())) {
      return { invalidBirthdate: true };
    }
    return calculateAge(birthdate) >= 13 ? null : { invalidBirthdate: true };
  };
}

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const errors = getPasswordErrors(control.value ?? '');
    return errors.length > 0 ? { passwordStrength: errors } : null;
  };
}

export function passwordMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value ?? '';
    const confirm = group.get('passwordConfirm')?.value ?? '';
    return password === confirm ? null : { passwordMismatch: true };
  };
}

function getPasswordErrors(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres.');
  }
  if (password.length > 18) {
    errors.push('La contraseña debe tener como máximo 18 caracteres.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe incluir un número.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe incluir una letra mayúscula.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe incluir una letra minúscula.');
  }

  return errors;
}

function calculateAge(birthdate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const monthDifference = today.getMonth() - birthdate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }

  return age;
}
