const fs = require('fs');
const FormData = require('form-data');

// ⚠️ mets ici ton vrai token
const TOKEN = 'COLLE_TON_VRAI_TOKEN_ICI';

const form = new FormData();
form.append('image', fs.createReadStream('C:/Users/jerem/Documents/PostmanWD/test.jpg'));

fetch('http://127.0.0.1:5000/api/galleries/upload', {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}`, ...form.getHeaders() },
  body: form,
})
  .then(r => r.text())
  .then(console.log)
  .catch(console.error);
