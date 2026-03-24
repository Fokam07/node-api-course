const prisma = require('../db/prisma');

class LivreService {
  async findAll() {
    return prisma.livre.findMany();
  }

  async findById(id) {
    const livre = await prisma.livre.findUnique({
      where: { id: parseInt(id) }
    });

    if (!livre) {
      throw { status: 404, message: 'Livre introuvable' };
    }

    return livre;
  }

  async create(data) {
    const { titre, auteur, annee, genre } = data;
    return prisma.livre.create({ 
      data: { titre, auteur, annee, genre } 
    });
  }

  async update(id, data) {
    await this.findById(id);

    const { titre, auteur, annee, genre } = data;
    return prisma.livre.update({
      where: { id: parseInt(id) },
      data: { titre, auteur, annee, genre }
    });
  }

  async delete(id) {
    await this.findById(id);

    return prisma.livre.delete({
      where: { id: parseInt(id) }
    });
  }

  async emprunter(livreId, userId) {
    const livre = await this.findById(livreId);

    if (!livre.disponible) {
      throw { status: 409, message: 'Livre non disponible' };
    }

    return prisma.$transaction(async (tx) => {
      await tx.livre.update({
        where: { id: parseInt(livreId) },
        data: { disponible: false }
      });

      return tx.emprunt.create({
        data: {
          livreId: parseInt(livreId),
          userId: parseInt(userId)
        }
      });
    });
  }

  async retourner(livreId, userId) {
    return prisma.$transaction(async (tx) => {
      const emprunt = await tx.emprunt.findFirst({
        where: {
          livreId: parseInt(livreId),
          userId: parseInt(userId),
          dateRetour: null
        }
      });

      if (!emprunt) {
        throw { status: 404, message: 'Emprunt introuvable' };
      }

      await tx.livre.update({
        where: { id: parseInt(livreId) },
        data: { disponible: true }
      });

      return tx.emprunt.update({
        where: { id: emprunt.id },
        data: { dateRetour: new Date() }
      });
    });
  }
}

module.exports = new LivreService();
