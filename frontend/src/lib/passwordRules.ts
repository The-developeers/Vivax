export interface PasswordCriterion {
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_CRITERIA: PasswordCriterion[] = [
  { label: "Mínimo de 8 caracteres", test: (p) => p.length >= 8 },
  { label: "Uma letra maiúscula", test: (p) => /[A-Z]/.test(p) },
  { label: "Uma letra minúscula", test: (p) => /[a-z]/.test(p) },
  { label: "Um número", test: (p) => /\d/.test(p) },
  { label: "Um caractere especial", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function isPasswordValid(password: string): boolean {
  return PASSWORD_CRITERIA.every((criterion) => criterion.test(password));
}

export const PASSWORD_HINT =
  "Mínimo de 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.";
