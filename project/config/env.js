require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'sqlite:./dev.db',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key'
};