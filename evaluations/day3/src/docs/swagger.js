const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Bibliothèque - Jour 3',
      version: '1.0.0',
      description: 'API de gestion de bibliothèque avec sécurité avancée (refresh tokens, rate limiting, etc.)',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { 
          type: 'http', 
          scheme: 'bearer', 
          bearerFormat: 'JWT',
          description: 'Access token JWT pour authentification'
        }
      }
    }
  },
  apis: [path.join(__dirname, '../routes/*.js')],
};

module.exports = swaggerJsdoc(options);
