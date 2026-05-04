import prisma from "../lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Starting seeding...\n");

  // Supprimer les données existantes (dans l'ordre des dépendances)
  await prisma.t_sessions.deleteMany();
  await prisma.t_newsLetters.deleteMany();
  await prisma.t_newsLetters_status.deleteMany();
  await prisma.t_readers.deleteMany();
  await prisma.t_admins.deleteMany();

  // ===== CRÉER LES STATUTS =====
  console.log("📋 Creating newsletter statuses...");
  const statuses = [
    {
      displayName: "Brouillon",
      status: "DRAFT",
      textColor: "#808080",
      backgroundColor: "#D3D3D3",
    },
    {
      displayName: "Planifiée",
      status: "SCHEDULED",
      textColor: "#B8860B",
      backgroundColor: "#FFD699",
    },
    {
      displayName: "En cours",
      status: "IN_PROGRESS",
      textColor: "#0000FF",
      backgroundColor: "#ADD8E6",
    },
    {
      displayName: "Terminée",
      status: "COMPLETED",
      textColor: "#2D5016",
      backgroundColor: "#90EE90",
    },
    {
      displayName: "Échouée",
      status: "FAILED",
      textColor: "#CC0000",
      backgroundColor: "#FFB3B3",
    },
  ];

  const createdStatuses = await Promise.all(
    statuses.map((status) => prisma.t_newsLetters_status.create({ data: status }))
  );
  console.log(`✅ ${createdStatuses.length} statuses created\n`);

  // ===== CRÉER LES ADMINS =====
  console.log("👤 Creating admins...");
  const admins = [
    {
      email: "admin@agora.com",
      name: "Admin",
      lastName: "Agora",
      password: await bcrypt.hash("admin123", 10),
    },
    {
      email: "editor@agora.com",
      name: "Editor",
      lastName: "Agora",
      password: await bcrypt.hash("editor123", 10),
    },
  ];

  const createdAdmins = await Promise.all(
    admins.map((admin) => prisma.t_admins.create({ data: admin }))
  );
  console.log(`✅ ${createdAdmins.length} admins created\n`);

  // ===== CRÉER UNE SESSION DE TEST =====
  console.log("🔐 Creating a test session...");
  const sessionTokenHash = await bcrypt.hash("seed-session-token", 10);
  await prisma.t_sessions.create({
    data: {
      token: sessionTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      admin: { connect: { admin_id: createdAdmins[0].admin_id } },
    },
  });
  console.log("✅ 1 session created\n");

  // ===== CRÉER LES LECTEURS =====
  console.log("👥 Creating readers...");
  const readers = [
    {
      email: "jean.dupont@example.com",
      consentGiven: true,
      unsubscribeToken: "token_jean_dupont_123abc",
    },
    {
      email: "marie.martin@example.com",
      consentGiven: true,
      unsubscribeToken: "token_marie_martin_456def",
    },
    {
      email: "thomas.nardou@eduvaud.ch",
      consentGiven: true,
      unsubscribeToken: "token_pierre_bernard_789ghi",
    },
    {
      email: "claire.rousseau@example.com",
      consentGiven: true,
      unsubscribeToken: "token_claire_rousseau_012jkl",
    },
    {
      email: "thomas.lefebvre@example.com",
      consentGiven: true,
      unsubscribeToken: "token_thomas_lefebvre_345mno",
    },
  ];

  const createdReaders = await Promise.all(
    readers.map((reader) => prisma.t_readers.create({ data: reader }))
  );
  console.log(`✅ ${createdReaders.length} readers created\n`);

  // ===== CRÉER LES NEWSLETTERS =====
  console.log("📰 Creating newsletters...");
  const now = Date.now();
  const min = 60 * 1000; // 1 minute in milliseconds
  const newsletters = [
    {
      name: "Bienvenue dans Agora",
      body: `# Bienvenue! 🎉

## Découvrez notre plateforme

Agora est une plateforme moderne de gestion de newsletters.

### Fonctionnalités principales

- **Gestion facile** : Créez et planifiez vos newsletters en quelques clics
- **Design responsive** : Vos newsletters s'affichent parfaitement sur tous les appareils
- **Statistiques** : Suivez l'engagement de votre audience

> "Agora nous a permis de doubler notre engagement!" - Un utilisateur heureux

[Découvrir plus](https://www.etml.ch/)`,
      sendAt: new Date(now + 2 * min),
      newsLetter_status_fk: createdStatuses[1].status_id, // Planifiée
    },
    {
      name: "Actualités du mois d'avril",
      body: `# Actualités - Avril 2026

## Les meilleures nouvelles du mois

### Mise à jour 2.1

- Amélioration des performances
- Nouveau système de thèmes
- Interface simplifiée

### Évènement à venir

Rejoignez-nous le **15 mai** pour notre webinaire exclusif!

\`\`\`
Date: 15/05/2026
Heure: 14h00
Lien: https://www.etml.ch/
\`\`\``,
      sendAt: new Date(now + 4 * min),
      newsLetter_status_fk: createdStatuses[1].status_id, // Planifiée
    },
    {
      name: "Newsletter - Mai 2026",
      body: `# Spécial mai - Offres exclusives

## 🎁 Promotions du mois

### 20% de réduction

Utilisez le code **MAI2026** pour profiter de 20% de réduction sur tous les plans premium!

**Valable jusqu'au 31 mai uniquement.**

### Nouvelles fonctionnalités

- Export en PDF
- Calendrier d'édition collaboratif
- API webhooks

---

*Dernière mise à jour: 29 avril 2026*`,
      sendAt: new Date(now + 6 * min),
      newsLetter_status_fk: createdStatuses[1].status_id, // Planifiée
    },
    {
      name: "Brouillon - Test",
      body: `# Test de newsletter

Ceci est une newsletter en brouillon pour tester le système.

## Contenu à compléter

- [ ] Ajouter les images
- [ ] Vérifier les liens
- [ ] Réviser le contenu`,
      sendAt: new Date(now + 8 * min),
      newsLetter_status_fk: createdStatuses[1].status_id, // Planifiée
    },
    {
      name: "Newsletter échouée - Juin",
      body: `# Newsletter - Juin 2026

Tentative d'envoi échouée. Veuillez vérifier les paramètres et réessayer.

## Contenu

Ceci était destiné à être envoyé le 1er juin.`,
      sendAt: new Date(now + 10 * min),
      newsLetter_status_fk: createdStatuses[1].status_id, // Planifiée
    },
  ];

  const createdNewsletters = await Promise.all(
    newsletters.map((newsletter) => prisma.t_newsLetters.create({ data: newsletter }))
  );
  console.log(`✅ ${createdNewsletters.length} newsletters created\n`);

  // ===== ATTRIBUER LES LECTEURS AUX NEWSLETTERS =====
  console.log("📧 Assigning readers to newsletters...");
  const newsletterReaderAssignments = [];
  for (const newsletter of createdNewsletters) {
    for (const reader of createdReaders) {
      newsletterReaderAssignments.push({
        newsLetter_fk: newsletter.newsLetter_id,
        reader_fk: reader.reader_id,
        sentAt: null,
      });
    }
  }
  await prisma.t_newsLetters_readers.createMany({ data: newsletterReaderAssignments });
  console.log(`✅ ${newsletterReaderAssignments.length} reader assignments created\n`);

  console.log("🎉 Seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`  - Admins: ${createdAdmins.length}`);
  console.log(`  - Readers: ${createdReaders.length}`);
  console.log(`  - Statuses: ${createdStatuses.length}`);
  console.log(`  - Newsletters: ${createdNewsletters.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
