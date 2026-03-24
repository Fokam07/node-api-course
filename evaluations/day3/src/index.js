// Main entry point
const app = require('./app');
const env = require('./config/env');
const { execSync } = require('child_process');

const PORT = env.port;

// Run seed on first startup
async function initializeDatabase() {
  try {
    console.log('🌱 Initializing database with seed...');
    execSync('node prisma/seed.js', { cwd: __dirname + '/..', stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  Seed already initialized or error occurred');
  }
}

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Swagger available at http://localhost:${PORT}/api-docs`);
  });
});
