import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@stylehub.com'
  const password = 'Admin@123'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    // Update role to admin if already exists
    await prisma.user.update({ where: { email }, data: { role: 'admin' } })
    console.log(`✅ Existing user "${email}" updated to admin.`)
    return
  }

  const hashed = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: 'Admin',
      role: 'admin',
    },
  })

  console.log('✅ Admin account created!')
  console.log(`   Email   : ${email}`)
  console.log(`   Password: ${password}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
