import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: number;
  email: string;
  companyId: number;
}

const generateToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: string,
): string => {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

const verifyToken = (token: string, secret: string): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const generateAccessToken = (payload: JwtPayload): string => {
  return generateToken(
    payload,
    process.env.JWT_SECRET!,
    process.env.JWT_EXPIRES_IN || '1h',
  );
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!;
  return generateToken(
    payload,
    secret,
    process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  );
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return verifyToken(token, process.env.JWT_SECRET!);
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!;
  return verifyToken(token, secret);
};
