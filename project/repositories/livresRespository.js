const prisma = require('../database/prisma');


// Trouver tous les livres disponibles
const livres = await prisma.livre.findMany({
  where: { disponible: true },
  orderBy: { titre: 'asc' },
});

// Trouver un livre avec ses emprunts
const livre = await prisma.livre.findUnique({
  where: { id: 1 },
  include: { emprunts: { include: { user: true } } },
});

// Créer un livre
const nouveau = await prisma.livre.create({
  data: { titre: 'Node.js en action', auteur: 'Mike Cantelon', annee: 2017 },
});

// Mettre à jour
const modifie = await prisma.livre.update({
  where: { id: 1 },
  data: { disponible: false },
});

// Supprimer
await prisma.livre.delete({ where: { id: 1 } });

// Compter
const count = await prisma.livre.count({ where: { genre: 'Informatique' } });

module.exports = {
  livres,
  livre,
    nouveau,
    modifie,
    count,
};