const { Template, User } = require('../models');

// Create new template
const createTemplate = async (req, res) => {
  try {
    const { name, type, description, fields } = req.body;
    const issuerId = req.user.id;

    console.log('Creating template with data:', { name, type, description, fields, issuerId });

    const template = await Template.create({
      name,
      type,
      description,
      fields,
      issuerId
    });

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template
    });
  } catch (error) {
    console.error('Create template error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: `Failed to create template: ${error.message}`
    });
  }
};

// Get templates for issuer
const getTemplates = async (req, res) => {
  try {
    const issuerId = req.user.id;
    const templates = await Template.findAll({
      where: { issuerId, isActive: true },
      order: [['updatedAt', 'DESC']]
    });

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates'
    });
  }
};

// Update template
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, description, fields } = req.body;
    const issuerId = req.user.id;

    const template = await Template.findOne({
      where: { id, issuerId }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    await template.update({
      name,
      type,
      description,
      fields
    });

    res.json({
      success: true,
      message: 'Template updated successfully',
      data: template
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update template'
    });
  }
};

// Delete template
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const issuerId = req.user.id;

    const template = await Template.findOne({
      where: { id, issuerId }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    await template.update({ isActive: false });

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete template'
    });
  }
};

module.exports = {
  createTemplate,
  getTemplates,
  updateTemplate,
  deleteTemplate
};