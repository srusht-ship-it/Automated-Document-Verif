// Test individual document upload
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testIndividualUpload() {
  try {
    // Login as individual
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'individual@demo.com',
      password: 'demo123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Individual login successful');
    
    // Create a test file
    const testContent = 'This is a test document for individual upload.';
    fs.writeFileSync('test-doc.txt', testContent);
    
    // Create form data
    const formData = new FormData();
    formData.append('document', fs.createReadStream('test-doc.txt'));
    formData.append('documentType', 'other');
    formData.append('description', 'Test document upload for individual');
    
    // Upload document
    const uploadResponse = await axios.post('http://localhost:5000/api/documents/upload', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Upload successful:', uploadResponse.data.message);
    console.log('Document ID:', uploadResponse.data.data.document.id);
    
    // Clean up test file
    fs.unlinkSync('test-doc.txt');
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    
    // Clean up test file if it exists
    try {
      fs.unlinkSync('test-doc.txt');
    } catch (e) {}
  }
}

testIndividualUpload();