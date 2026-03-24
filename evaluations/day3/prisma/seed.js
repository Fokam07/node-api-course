const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'fokamprince39@gmail.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin123', 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        nom: 'Admin',
        email: 'fokamprince39@gmail.com',
        password: hashedPassword,
        role: 'admin'
      }
    });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: fokamprince39@gmail.com');
    console.log('🔐 Password: Admin123');

    // Create some sample books
    const livres = [
      {
        titre: 'Le Seigneur des Anneaux',
        auteur: 'J.R.R. Tolkien',
        annee: 1954,
        genre: 'Fantasy'
      },
      {
        titre: '1984',
        auteur: 'George Orwell',
        annee: 1949,
        genre: 'Dystopie'
      },
      {
        titre: 'Le Château',
        auteur: 'Franz Kafka',
        annee: 1926,
        genre: 'Littérature classique'
      },
      {
        titre: 'Cent ans de solitude',
        auteur: 'Gabriel García Márquez',
        annee: 1967,
        genre: 'Réalisme magique'
      },
      {
        titre: 'Les Misérables',
        auteur: 'Victor Hugo',
        annee: 1862,
        genre: 'Littérature classique'
      }
    ];

    for (const livre of livres) {
      await prisma.livre.create({
        data: livre
      });
    }

    console.log('📚 Sample books created (5 books)');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
