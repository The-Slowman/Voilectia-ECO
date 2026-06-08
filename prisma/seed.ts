import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Voilectia database...')

  // ─── Admin par défaut ──────────────────────────────────────
  const hashedPassword = await bcrypt.hash('VoilectiaAdmin2024!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@voilectia.fr' },
    update: {},
    create: {
      name: 'Gregory',
      email: 'admin@voilectia.fr',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Admin créé:', admin.email)


  // ─── Paramètres du site ────────────────────────────────────
  await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      siteName: 'Voilectia ECO',
      siteDescription: 'Serveur Eco Semi-RP Chill français — Économie, Coopération, Constructions',
      discordUrl: 'https://discord.gg/voilectia',
      serverIp: 'voilectia.fr',
      serverPort: '3000',
      tipeeeUrl: 'https://fr.tipeee.com/voilectia',
      contactEmail: 'contact@voilectia.fr',
      season: 'S1',
      heroTitle: 'Bienvenue sur Voilectia',
      heroSubtitle: 'Serveur Eco Semi-RP Chill — Économie • Coopération • Constructions',
    },
  })
  console.log('✅ Paramètres du site créés')

  // ─── Catégories du règlement ───────────────────────────────
  const ruleCategories = [
    { name: 'Comportement général', icon: 'users', order: 1 },
    { name: 'Chat & Communication', icon: 'message-circle', order: 2 },
    { name: 'Constructions', icon: 'building', order: 3 },
    { name: 'Économie & Commerce', icon: 'coins', order: 4 },
    { name: 'RP & Jeu', icon: 'gamepad-2', order: 5 },
    { name: 'Administration', icon: 'shield', order: 6 },
  ]

  for (const cat of ruleCategories) {
    const created = await prisma.ruleCategory.upsert({
      where: { id: cat.name },
      update: {},
      create: { id: cat.name, ...cat },
    })

    // Règles de démo
    if (cat.order === 1) {
      await prisma.rule.createMany({
        data: [
          {
            categoryId: created.id,
            title: 'Respect & Bienveillance',
            content: 'Le respect mutuel est la base de notre communauté. Tout comportement toxique, discriminatoire ou malveillant est strictement interdit. Nous visons une communauté mature et inclusive.',
            order: 1,
            severity: 'danger',
          },
          {
            categoryId: created.id,
            title: 'Interdiction du harcèlement',
            content: 'Toute forme de harcèlement, de discrimination ou d\'intimidation envers un membre de la communauté est interdite et peut mener à un ban permanent.',
            order: 2,
            severity: 'danger',
          },
          {
            categoryId: created.id,
            title: 'Fairplay',
            content: 'Jouer dans l\'esprit du serveur Semi-RP. L\'exploitation de bugs ou de mécaniques non intentionnelles doit être signalée à l\'équipe de staff.',
            order: 3,
            severity: 'warning',
          },
        ],
        skipDuplicates: true,
      })
    }
  }
  console.log('✅ Règlement créé')

  // ─── FAQ de démo ───────────────────────────────────────────
  const faqCat = await prisma.faqCategory.upsert({
    where: { id: 'getting-started' },
    update: {},
    create: {
      id: 'getting-started',
      name: 'Premiers pas',
      icon: 'rocket',
      order: 1,
    },
  })

  await prisma.faqItem.createMany({
    data: [
      {
        categoryId: faqCat.id,
        question: 'Comment rejoindre le serveur Voilectia ?',
        answer: 'Lancez Eco, allez dans la liste des serveurs, recherchez "Voilectia" ou entrez directement l\'IP du serveur. Vous pouvez également rejoindre notre Discord pour avoir l\'IP exacte.',
        order: 1,
      },
      {
        categoryId: faqCat.id,
        question: 'Qu\'est-ce que la monnaie VLC ?',
        answer: 'Le VLC (VoiLeCtion) est la monnaie unique du serveur Voilectia. Elle est utilisée pour tous les échanges économiques. Le système EcoGnome permet de gérer les boutiques et les prix.',
        order: 2,
      },
      {
        categoryId: faqCat.id,
        question: 'Est-ce que le RP est obligatoire ?',
        answer: 'Non ! Voilectia est un serveur Semi-RP Chill. Le RP est encouragé via les constructions et l\'économie, mais il n\'y a aucune obligation de RP vocal ou textuel.',
        order: 3,
      },
    ],
    skipDuplicates: true,
  })
  console.log('✅ FAQ créée')

  // ─── Staff de démo ─────────────────────────────────────────
  await prisma.staffMember.createMany({
    data: [
      {
        name: 'Fondateur',
        role: 'Fondateur & Admin',
        description: 'Créateur du serveur Voilectia. Gestion globale du serveur, de l\'économie et de la communauté.',
        order: 1,
        active: true,
      },
      {
        name: 'Modérateur',
        role: 'Modérateur',
        description: 'Veille au bon déroulement des parties et au respect du règlement.',
        order: 2,
        active: true,
      },
    ],
    skipDuplicates: false,
  })
  console.log('✅ Staff créé')

  // ─── Article de démo ───────────────────────────────────────
  await prisma.article.upsert({
    where: { slug: 'bienvenue-sur-voilectia' },
    update: {},
    create: {
      title: 'Bienvenue sur Voilectia ECO !',
      slug: 'bienvenue-sur-voilectia',
      excerpt: 'Le serveur Voilectia ouvre ses portes ! Découvrez notre vision d\'un serveur Eco Semi-RP chill axé sur la coopération et les constructions.',
      content: `<h2>Bienvenue sur Voilectia !</h2>
<p>Nous sommes fiers d'ouvrir les portes de <strong>Voilectia ECO</strong>, un serveur Semi-RP Chill français dédié à la coopération, l'économie et les constructions.</p>
<h3>Notre vision</h3>
<p>Voilectia est né d'une volonté simple : créer un espace de jeu mature, bienveillant et équilibré où chaque joueur peut s'épanouir à son rythme.</p>
<ul>
<li>🌿 <strong>Économie équilibrée</strong> avec la monnaie VLC</li>
<li>🤝 <strong>Fédération</strong> comme gouvernement central</li>
<li>🛠️ <strong>Métiers variés</strong> pour une progression naturelle</li>
</ul>
<p>Rejoignez-nous sur Discord pour en savoir plus !</p>`,
      category: 'announcement',
      published: true,
      pinned: true,
      authorId: admin.id,
    },
  })
  console.log('✅ Article de démo créé')

  // ─── Changelog de démo ─────────────────────────────────────
  await prisma.changelog.create({
    data: {
      version: '1.0.0',
      title: 'Ouverture du serveur Voilectia',
      content: `<h3>🎉 Ouverture officielle</h3>
<ul>
<li>Lancement du serveur Voilectia ECO</li>
<li>Configuration du système EcoGnome</li>
<li>Mise en place de la monnaie VLC</li>
<li>Installation des premières boutiques</li>
<li>Création de la Fédération</li>
</ul>`,
      season: 'S1',
      type: 'major',
      published: true,
      publishedAt: new Date(),
      authorId: admin.id,
    },
  })
  console.log('✅ Changelog créé')

  // ─── Catégories du forum ───────────────────────────────────
  const forumCategories = [
    {
      id: 'tutoriels',
      name: 'Tutoriels',
      slug: 'tutoriels',
      description: 'Guides pas-à-pas rédigés par la communauté.',
      icon: '📚',
      color: '#3A7A52',
      order: 1,
    },
    {
      id: 'astuces',
      name: 'Astuces & Conseils',
      slug: 'astuces',
      description: 'Partagez vos petits secrets de jeu.',
      icon: '💡',
      color: '#D4A820',
      order: 2,
    },
    {
      id: 'constructions',
      name: 'Constructions',
      slug: 'constructions',
      description: 'Présentez vos créations architecturales.',
      icon: '🏗️',
      color: '#4A9EC4',
      order: 3,
    },
    {
      id: 'economie-forum',
      name: 'Économie & Commerce',
      slug: 'economie-commerce',
      description: 'Stratégies économiques, prix, échanges.',
      icon: '💰',
      color: '#C9900A',
      order: 4,
    },
    {
      id: 'discussions',
      name: 'Discussions générales',
      slug: 'discussions',
      description: 'Tout ce qui ne rentre pas ailleurs.',
      icon: '💬',
      color: '#6B8C6A',
      order: 5,
    },
  ]

  for (const cat of forumCategories) {
    await prisma.forumCategory.upsert({
      where:  { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Catégories forum créées')

  console.log('\n✨ Seed terminé avec succès !')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 Email admin: admin@voilectia.fr')
  console.log('🔑 Mot de passe: VoilectiaAdmin2024!')
  console.log('⚠️  CHANGEZ CE MOT DE PASSE EN PRODUCTION !')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
