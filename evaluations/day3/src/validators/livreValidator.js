const { z } = require('zod');

const livreCreateSchema = z.object({
  titre: z.string().min(1),
  auteur: z.string().min(1),
  annee: z.number().int().optional(),
  genre: z.string().optional()
});

const livreUpdateSchema = livreCreateSchema.partial();

module.exports = { livreCreateSchema, livreUpdateSchema };
