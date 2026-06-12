export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidUsername(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 6 || trimmed.length > 20) {
    return false;
  }
  return /^[a-zA-Z0-9._-]+$/.test(trimmed);
}

export function getPasswordErrors(password: string, confirm?: string): string[] {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres.');
  }
  if (password.length > 18) {
    errors.push('La contraseña debe tener menos de 18 caracteres.');
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
  if (confirm !== undefined && confirm !== password) {
    errors.push('Las contraseñas no coinciden.');
  }

  return errors;
}

export function calculateAge(birthdate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const monthDifference = today.getMonth() - birthdate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }

  return age;
}

export function isValidBirthdate(value: string): boolean {
  const birthdate = new Date(value);
  if (Number.isNaN(birthdate.getTime())) {
    return false;
  }
  return calculateAge(birthdate) >= 13;
}
