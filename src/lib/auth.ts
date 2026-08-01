/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { SignOptions } from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'learning-hub-super-secret-jwt-key-production-ready-2026-secure-token-v2';

// Warn if using fallback secret in development only
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'development') {
  console.warn('⚠️ WARNING: Using fallback JWT_SECRET. Please set JWT_SECRET in .env.local for production!');
}

export interface TokenPayload {
  [x: string]: any;
  userId: string;
  email: string;
  name: string;
  role: string;
}

// Generate JWT token
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: '7d'
  });
}

// Verify JWT token
export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET as string) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Get current user from cookies (server side)
export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return null;
    }

    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

// Set auth cookie (for server actions)
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
}

// Clear auth cookie (for server actions)
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  });
}