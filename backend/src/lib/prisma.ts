import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// A partir do Prisma 7, o PrismaClient não sabe mais se conectar sozinho:
// precisamos passar um "adapter" explícito dizendo qual driver de banco usar.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Reaproveita uma única instância do Prisma Client em todo o backend,
// em vez de criar uma nova conexão a cada arquivo que precisar do banco.
export const prisma = new PrismaClient({ adapter });