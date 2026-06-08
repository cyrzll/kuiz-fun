import { jwt } from 'hono/jwt';

export const JWT_SECRET = 'pancasila-fun-quiz-secret-key-12345';
export const authMiddleware = jwt({ secret: JWT_SECRET, alg: 'HS256' });
