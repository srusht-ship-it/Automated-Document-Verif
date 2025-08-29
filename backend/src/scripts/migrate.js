const { sequelize, testConnection } = require('../config/database');
const { syncModels } = require('../models');

const migrate = async () => {
  try {
    console.log('🔄 Starting database migration...');
    
    // Test connection
    await testConnection();
    
    // Sync models (create tables)
    await syncModels();
    
    console.log('✅ Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();