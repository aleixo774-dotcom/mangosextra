// Máscara de telefone brasileiro
// Formatos aceitos: (11) 99999-9999 ou (11) 9999-9999

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : "";
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  // Celular (9 dígitos): (11) 99999-9999
  if (digits.length <= 11) {
    const isCell = digits.length > 10 || digits[5] === "9";
    if (isCell && digits.length >= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    // Fixo (8 dígitos): (11) 9999-9999
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return value;
}

export function cleanPhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidPhone(value: string): boolean {
  const digits = cleanPhone(value);
  // 10 dígitos (fixo) ou 11 dígitos (celular com 9)
  return digits.length === 10 || digits.length === 11;
}
