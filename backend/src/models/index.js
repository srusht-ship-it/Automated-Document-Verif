const { sequelize } = require('../config/database');
const User = require('./User');
const Document = require('./Document');

// Define associations
User.hasMany(Document, { 
  foreignKey: 'issuerId', 
  as: 'issuedDocuments' 
});

User.hasMany(Document, { 
  foreignKey: 'individualId', 
  as: 'documents' 
});

Document.belongsTo(User, { 
  foreignKey: 'issuerId', 
  as: 'issuer' 
});

Document.belongsTo(User, { 
  foreignKey: 'individualId', 
  as: 'individual' 
});

// Sync models (for development only)
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized successfully');
  } catch (error) {
    console.error('❌ Model synchronization failed:', error);
  }
};

module.exports = {
  User,
  Document,
  sequelize,
  syncModels
};