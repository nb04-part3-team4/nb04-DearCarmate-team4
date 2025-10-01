import * as argon2 from 'argon2';

export const hashPassword = async (password: string): Promise<string> => {
  return await argon2.hash(password);
};

export const verifyPassword = async (hashedPassword: string, password: string): Promise<boolean> => {
  try {
    return await argon2.verify(hashedPassword, password);
  } catch (error) {
    return false;
  }
};
