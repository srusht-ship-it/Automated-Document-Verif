// Simple test script to verify upload endpoint
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    console.log('Testing document upload endpoint...');
    
    // First, test the health endpoint
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test auth endpoint (you'll need to replace with actual credentials)
    console.log('\n📝 Note: To test upload, you need to:');
    console.log('1. Start the backend server: npm start');
    console.log('2. Register a user or use existing credentials');
    console.log('3. Get an auth token from login');
    console.log('4. Use that token to test upload');
    
    console.log('\n🔧 Upload endpoint configuration:');
    console.log('- URL: http://localhost:5000/api/documents/upload');
    console.log('- Method: POST');
    console.log('- Headers: Authorization: Bearer <token>');
    console.log('- Body: FormData with "document" field');
    console.log('- Required fields: documentType, recipientEmail');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testUpload();