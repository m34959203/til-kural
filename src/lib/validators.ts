export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (password.length < 6) {
    errors.push({ field: 'password', message: 'Құпиясөз кемінде 6 таңбадан тұруы керек' });
  }
  return errors;
}

export function validateRegistration(data: {
  email?: string;
  password?: string;
  name?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Жарамды email енгізіңіз' });
  }
  if (!data.password) {
    errors.push({ field: 'password', message: 'Құпиясөз міндетті' });
  } else {
    errors.push(...validatePassword(data.password));
  }
  if (!data.name || data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Аты-жөніңізді енгізіңіз (кемінде 2 таңба)' });
  }

  return errors;
}

export function validateLogin(data: {
  email?: string;
  password?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Жарамды email енгізіңіз' });
  }
  if (!data.password) {
    errors.push({ field: 'password', message: 'Құпиясөз міндетті' });
  }

  return errors;
}

export function validateTestAnswer(data: {
  questionId?: string;
  answer?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.questionId) {
    errors.push({ field: 'questionId', message: 'Сұрақ ID міндетті' });
  }
  if (!data.answer) {
    errors.push({ field: 'answer', message: 'Жауап міндетті' });
  }

  return errors;
}
