require('dotenv').config();
const { sequelize, testConnection } = require('./src/config/database');

const test = async () => {
  try {
    console.log('Testing database connection...');
    await testConnection();
    console.log('✅ Database connection successful');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

test();