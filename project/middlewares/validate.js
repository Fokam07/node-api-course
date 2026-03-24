const { z } = require('zod');

/**
 * Middleware factory de validation
 * @param {z.ZodSchema} schema
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      // Formater les erreurs Zod
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      return res.status(400).json({
        error: 'Données invalides',
        details: errors,
      });
    }
    
    // Remplacer req.body par les données validées (et transformées)
    req.body = result.data;
    next();
  };
}

module.exports = validate;