#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create ADMIN user
  const email = process.env.ADMIN_EMAIL || 'admin@pristineshop.local';
  const password = process.env.ADMIN_PASSWORD || 'Password123!';
  const name = process.env.ADMIN_NAME || 'Admin';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin user already exists:', email);
  } else {
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, password: hashed, name, role: 'ADMIN' } });
    console.log('Created admin user:', user.id, email);
  }

  // Create SUPER_ADMIN user
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@pristineshop.local';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperPassword123!';
  const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

  const existingSuperAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } });
  if (existingSuperAdmin) {
    console.log('Super admin user already exists:', superAdminEmail);
  } else {
    const hashed = await bcrypt.hash(superAdminPassword, 12);
    const user = await prisma.user.create({ data: { email: superAdminEmail, password: hashed, name: superAdminName, role: 'SUPER_ADMIN' } });
    console.log('Created super admin user:', user.id, superAdminEmail);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
