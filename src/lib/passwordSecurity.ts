import bcrypt from 'bcryptjs';

// Numero di rounds per l'hashing (più alto = più sicuro ma più lento)
const SALT_ROUNDS = 12;

/**
 * Hash della password lato client per protezione extra
 * @param password Password in chiaro
 * @returns Promise con la password hashata
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    console.log('🔐 Hashing password lato client...');
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('✅ Password hashata con successo');
    return hashedPassword;
  } catch (error) {
    console.error('❌ Errore durante l\'hashing della password:', error);
    throw new Error('Errore durante la protezione della password');
  }
};

/**
 * Verifica se una password corrisponde al hash (utile per debug/testing)
 * @param password Password in chiaro
 * @param hash Hash da verificare
 * @returns Promise<boolean>
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('❌ Errore durante la verifica della password:', error);
    return false;
  }
};

/**
 * Genera un salt per l'hashing
 * @param rounds Numero di rounds (default: 12)
 * @returns Promise<string>
 */
export const generateSalt = async (rounds: number = SALT_ROUNDS): Promise<string> => {
  try {
    return await bcrypt.genSalt(rounds);
  } catch (error) {
    console.error('❌ Errore durante la generazione del salt:', error);
    throw new Error('Errore durante la generazione del salt');
  }
};

/**
 * Valida la forza della password prima dell'hashing
 * @param password Password da validare
 * @returns Object con validazione e suggerimenti
 */
export const validatePasswordStrength = (password: string) => {
  const minLength = 8;
  const checks = {
    length: password.length >= minLength,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    noCommonPatterns: !/123456|password|qwerty|abc123/i.test(password)
  };

  const score = Object.values(checks).filter(Boolean).length;
  const isValid = score >= 4 && checks.length;

  return {
    isValid,
    score,
    checks,
    strength: score < 2 ? 'very-weak' : score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong',
    suggestions: [
      !checks.length && 'Usa almeno 8 caratteri',
      !checks.lowercase && 'Aggiungi lettere minuscole',
      !checks.uppercase && 'Aggiungi lettere maiuscole', 
      !checks.numbers && 'Aggiungi numeri',
      !checks.special && 'Aggiungi caratteri speciali',
      !checks.noCommonPatterns && 'Evita pattern comuni (123456, password, ecc.)'
    ].filter(Boolean)
  };
};
