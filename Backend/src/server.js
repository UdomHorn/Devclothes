const app = require('./app');
const sequelize = require('./config/database');
const ensureDatabaseExists = require('./config/initDb');

const PORT = process.env.PORT || 5000;

// Test database connection and start server
async function startServer() {
  try {
    // 1. Ensure the PostgreSQL database exists (only local development)
    if (process.env.NODE_ENV !== 'production') {
      await ensureDatabaseExists();
    }

    // 2. Connect and authenticate
    await sequelize.authenticate();
    console.log('✅ Connection to PostgreSQL has been established successfully.');

    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized with schema changes.');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database or start server:', error);
  }
}

startServer();
