// Script one-shot — créer / remplacer le compte admin
// Exécuter via : node create-admin.js
// Supprimer ce fichier après utilisation.

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const password = '63634215Bk'
  const hashed   = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where:  { email: 'gregory.bihi02@gmail.com' },
    update: {
      name:     'TheSlowman',
      password: hashed,
      role:     'SUPER_ADMIN',
    },
    create: {
      name:     'TheSlowman',
      email:    'gregory.bihi02@gmail.com',
      password: hashed,
      role:     'SUPER_ADMIN',
    },
  })

  console.log('✅ Compte admin créé / mis à jour :')
  console.log('   ID    :', user.id)
  console.log('   Email :', user.email)
  console.log('   Pseudo:', user.name)
  console.log('   Rôle  :', user.role)
  console.log('')
  console.log('⚠️  Supprime ce fichier après connexion !')
}

main()
  .catch(e => { console.error('❌ Erreur :', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
