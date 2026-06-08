import { customAlphabet } from 'nanoid';

// Cryptographically secure slug — URL-safe, 12 chars
// Collision probability negligible at expected scale
const nanoid = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  12
);

export const generateSlug = (): string => nanoid();
