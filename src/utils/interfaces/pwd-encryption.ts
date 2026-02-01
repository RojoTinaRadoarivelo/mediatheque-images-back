import * as bcrypt from 'bcryptjs';

export const HashPassword = async (password: string, salt: number): Promise<string> =>
  await bcrypt.hash(password, salt);

export const ComparePasswords = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => await bcrypt.compare(plainPassword, hashedPassword);
