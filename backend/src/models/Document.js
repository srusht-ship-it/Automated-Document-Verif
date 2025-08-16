const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  originalName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'original_name'
  },
  filePath: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'file_path'
  },
  hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  issuerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'issuer_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  individualId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'individual_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  documentTypeId: {
    type: DataTypes.INTEGER,
    field: 'document_type_id',
    references: {
      model: 'document_types',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
  },
  extractedText: {
    type: DataTypes.TEXT,
    field: 'extracted_text'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'documents',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Document;