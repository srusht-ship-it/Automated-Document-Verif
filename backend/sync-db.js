const { sequelize } = require('./src/config/database');
const { syncModels } = require('./src/models');

async function syncDatabase() {
  try {
    console.log('🔄 Syncing database models...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database synced successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
}

syncDatabase();