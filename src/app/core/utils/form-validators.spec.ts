import { FormControl, FormGroup } from '@angular/forms';

import {
  birthdateValidator,
  emailValidator,
  passwordMatchValidator,
  passwordStrengthValidator,
} from './form-validators';

function birthdateYearsAgo(years: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().slice(0, 10);
}

describe('form-validators', () => {
  describe('emailValidator', () => {
    const validate = emailValidator();

    it('acepta un correo con formato valido', () => {
      expect(validate(new FormControl('cliente@test.cl'))).toBeNull();
      expect(validate(new FormControl('  nombre.apellido@duoc.cl  '))).toBeNull();
    });

    it('rechaza correos sin formato valido', () => {
      expect(validate(new FormControl('correo-sin-arroba'))).toEqual({ invalidEmail: true });
      expect(validate(new FormControl('sin@dominio'))).toEqual({ invalidEmail: true });
      expect(validate(new FormControl('@test.cl'))).toEqual({ invalidEmail: true });
      expect(validate(new FormControl(''))).toEqual({ invalidEmail: true });
    });
  });

  describe('passwordStrengthValidator', () => {
    const validate = passwordStrengthValidator();

    it('acepta una contrasena que cumple la complejidad', () => {
      expect(validate(new FormControl('Cliente1!'))).toBeNull();
    });

    it('rechaza contrasenas cortas', () => {
      const result = validate(new FormControl('Ab1'));

      expect(result?.['passwordStrength']).toContain('La contraseña debe tener al menos 6 caracteres.');
    });

    it('rechaza contrasenas sin mayuscula, minuscula o numero', () => {
      expect(validate(new FormControl('cliente1!'))?.['passwordStrength']).toContain(
        'La contraseña debe incluir una letra mayúscula.',
      );
      expect(validate(new FormControl('CLIENTE1!'))?.['passwordStrength']).toContain(
        'La contraseña debe incluir una letra minúscula.',
      );
      expect(validate(new FormControl('Cliente!'))?.['passwordStrength']).toContain(
        'La contraseña debe incluir un número.',
      );
    });

    it('rechaza contrasenas sin caracter especial', () => {
      expect(validate(new FormControl('Cliente1'))?.['passwordStrength']).toContain(
        'La contraseña debe incluir un carácter especial.',
      );
    });

    it('rechaza contrasenas demasiado largas', () => {
      const result = validate(new FormControl('Cliente12345678901!'));

      expect(result?.['passwordStrength']).toContain(
        'La contraseña debe tener como máximo 18 caracteres.',
      );
    });
  });

  describe('birthdateValidator', () => {
    const validate = birthdateValidator();

    it('acepta una fecha con edad minima de 13 anos', () => {
      expect(validate(new FormControl(birthdateYearsAgo(13)))).toBeNull();
      expect(validate(new FormControl(birthdateYearsAgo(20)))).toBeNull();
    });

    it('rechaza menores de 13 anos', () => {
      expect(validate(new FormControl(birthdateYearsAgo(12)))).toEqual({ invalidBirthdate: true });
    });

    it('rechaza fechas invalidas', () => {
      expect(validate(new FormControl('fecha-invalida'))).toEqual({ invalidBirthdate: true });
      expect(validate(new FormControl(''))).toEqual({ invalidBirthdate: true });
    });
  });

  describe('passwordMatchValidator', () => {
    const validate = passwordMatchValidator();

    it('acepta contrasenas coincidentes', () => {
      const group = new FormGroup({
        password: new FormControl('Cliente1!'),
        passwordConfirm: new FormControl('Cliente1!'),
      });

      expect(validate(group)).toBeNull();
    });

    it('rechaza contrasenas que no coinciden', () => {
      const group = new FormGroup({
        password: new FormControl('Cliente1!'),
        passwordConfirm: new FormControl('OtraClave1!'),
      });

      expect(validate(group)).toEqual({ passwordMismatch: true });
    });
  });
});
