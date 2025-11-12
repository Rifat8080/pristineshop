#!/usr/bin/env node
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

function readEnvLocal(path = '.env.local') {
  if (!fs.existsSync(path)) return {};
  const raw = fs.readFileSync(path, 'utf8');
  const lines = raw.split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) {
      let val = m[2];
      // Remove surrounding quotes
      if ((val.startsWith("\'") && val.endsWith("\'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1);
      }
      env[m[1]] = val;
    }
  }
  return env;
}

async function main() {
  const env = readEnvLocal('.env.local');
  const secret = env.JWT_SECRET || process.env.JWT_SECRET;
  const adminEmail = process.env.ADMIN_EMAIL || env.ADMIN_EMAIL || 'admin@pristineshop.local';

  if (!secret) {
    console.error('JWT_SECRET not set in .env.local or environment. Please set it and retry.');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    console.error('Admin user not found:', adminEmail);
    await prisma.$disconnect();
    process.exit(1);
  }

  const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, secret, { expiresIn: '7d' });
  console.log(token);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
