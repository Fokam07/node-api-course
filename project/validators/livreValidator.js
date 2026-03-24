const { z } = require('zod');

const livreCreateSchema = z.object({
  titre: z.string()
    .min(1, 'Le titre est obligatoire')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères'),
  auteur: z.string()
    .min(1, "L'auteur est obligatoire"),
  annee: z.number()
    .int()
    .min(1000, 'Année invalide')
    .max(new Date().getFullYear(), 'Année dans le futur')
    .optional(),
  genre: z.enum(['Informatique', 'Roman', 'Science-Fiction', 'Histoire', 'Autre'])
    .optional(),
  disponible: z.boolean().default(true),
});

const livreUpdateSchema = livreCreateSchema.partial(); // Tous les champs optionnels

module.exports = { livreCreateSchema, livreUpdateSchema };