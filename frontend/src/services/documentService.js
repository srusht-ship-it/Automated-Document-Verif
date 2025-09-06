// File: frontend/src/services/documentService.js

import { apiMethods, apiHelpers } from './api';

class DocumentService {
  /**
   * Upload a new document
   * @param {FormData} formData - Form data containing file and metadata
   * @returns {Promise<Object>} Upload response
   */
  async uploadDocument(formData) {
    try {
      const response = await apiMethods.documents.upload(formData);
      return response.data;
    } catch (error) {
      console.error('Document upload error:', error);
      throw apiHelpers.handleError(error);
    }
  }

  /**
   * Get all documents for the current user
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Documents list response
   */
  async getDocuments(filters = {}) {
    try {
      const response = await apiMethods.documents.getAll(filters);
      return response.data;
    } catch (error) {
      console.error('Get documents error:', error);
      throw apiHelpers.handleError(error);
    }
  }

  /**
   * Get a specific document by ID
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Document response
   */
  async getDocumentById(documentId) {
    try {
      const response = await apiMethods.documents.getById(documentId);
      return response.data;
    } catch (error) {
      console.error('Get document error:', error);
      throw apiHelpers.handleError(error);
    }
  }

  /**
   * Update document metadata
   * @param {string} documentId - Document ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Update response
   */
  async updateDocument(documentId, updateData) {
    try {
      const response = await apiMethods.documents.update(documentId, updateData);
      return response.data;
    } catch (error) {
      console.error('Update document error:', error);
      throw apiHelpers.handleError(error);
    }
  }

  /**
   * Delete a document
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteDocument(documentId) {
    try {
      const response = await apiMethods.documents.delete(documentId);
      return response.data;
    } catch (error) {
      console.error('Delete document error:', error);
      throw apiHelpers.handleError(error);
    }
  }

  /**
   * Download a document
   * @param {string} documentId - Document ID
   * @returns {Promise<Blob>} File blob
   */
  async downloadDocument(documentId) {
    try {
      const response = await apiMethods.documents.download(documentId);
      return response.data;
    } catch (error) {
      console.error('Download document error:', error);
      throw apiHelpers.handleError(error);
    }
  }

  /**
   * Create download URL for a document blob
   * @param {Blob} blob - File blob
   * @param {string} filename - File name
   * @returns {string} Download URL
   */
  createDownloadUrl(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

// Create and export singleton instance
const documentService = new DocumentService();
export default documentService;