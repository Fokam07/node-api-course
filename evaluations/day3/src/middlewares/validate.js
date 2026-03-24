const { ZodError } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ 
          error: 'Validation échouée',
          details: err.errors 
        });
      }
      next(err);
    }
  };
}

module.exports = validate;
