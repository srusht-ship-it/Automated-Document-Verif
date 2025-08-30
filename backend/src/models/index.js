const { sequelize } = require('../config/database');
const User = require('./User');
const Document = require('./Document');
const Template = require('./Template');

// Define associations
User.hasMany(Document, { 
  foreignKey: 'issuerId', 
  as: 'issuedDocuments' 
});

User.hasMany(Document, { 
  foreignKey: 'individualId', 
  as: 'documents' 
});

User.hasMany(Template, {
  foreignKey: 'issuerId',
  as: 'templates'
});

Document.belongsTo(User, { 
  foreignKey: 'issuerId', 
  as: 'issuer' 
});

Document.belongsTo(User, { 
  foreignKey: 'individualId', 
  as: 'individual' 
});

Template.belongsTo(User, {
  foreignKey: 'issuerId',
  as: 'issuer'
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
  Template,
  sequelize,
  syncModels
};