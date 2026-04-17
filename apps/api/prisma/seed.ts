import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const PERMISSIONS = [
  // member
  { key: 'member:view',              description: 'Visualizar sócios',               resource: 'member' },
  { key: 'member:create',            description: 'Cadastrar sócios',                resource: 'member' },
  { key: 'member:edit',              description: 'Editar sócios',                   resource: 'member' },
  { key: 'member:deactivate',        description: 'Inativar sócios',                 resource: 'member' },
  // area
  { key: 'area:view',                description: 'Visualizar áreas',                resource: 'area' },
  { key: 'area:create',              description: 'Criar áreas',                     resource: 'area' },
  { key: 'area:edit',                description: 'Editar áreas',                    resource: 'area' },
  { key: 'area:delete',              description: 'Excluir áreas',                   resource: 'area' },
  // agenda
  { key: 'agenda:view',              description: 'Visualizar agendas',              resource: 'agenda' },
  { key: 'agenda:create',            description: 'Criar agendas',                   resource: 'agenda' },
  { key: 'agenda:edit',              description: 'Editar agendas',                  resource: 'agenda' },
  { key: 'agenda:delete',            description: 'Excluir agendas',                 resource: 'agenda' },
  // booking
  { key: 'booking:view',             description: 'Visualizar agendamentos',         resource: 'booking' },
  { key: 'booking:create',           description: 'Criar agendamentos',              resource: 'booking' },
  { key: 'booking:cancel',           description: 'Cancelar agendamentos',           resource: 'booking' },
  // schedule
  { key: 'schedule-config:manage',   description: 'Gerenciar rotinas automáticas',   resource: 'schedule-config' },
  // user
  { key: 'user:view',                description: 'Listar usuários',                 resource: 'user' },
  { key: 'user:create',              description: 'Criar acesso para sócios',        resource: 'user' },
  { key: 'user:deactivate',          description: 'Inativar conta de sócio',         resource: 'user' },
  // access-profile
  { key: 'profile:view',             description: 'Visualizar perfis de acesso',     resource: 'access-profile' },
]

async function main() {
  console.log('Seeding permissions…')
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({ where: { key: p.key }, update: {}, create: p })
  }
  console.log(`${PERMISSIONS.length} permissions upserted.`)

  // Default admin user (only if no admin exists)
  const adminExists = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!adminExists) {
    console.log('Creating default admin user…')
    const passwordHash = await bcrypt.hash('Admin@123', 12)
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@clube.com',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    })
    await prisma.userCredential.create({
      data: {
        userId: admin.id,
        passwordHash,
        mustChangePassword: true,
      },
    })
    console.log(`Admin created: ${admin.email} / Admin@123  (troque a senha no primeiro acesso)`)
  } else {
    console.log('Admin already exists — skipping.')
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
