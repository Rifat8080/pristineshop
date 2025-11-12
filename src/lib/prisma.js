import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

// Prevent multiple instances of Prisma Client in development
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV === 'development') globalForPrisma.prisma = prisma;

export default prisma;
