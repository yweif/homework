const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const imagePath = process.argv[2] || 'C:\\homework\\task1.jpg';

if (!fs.existsSync(imagePath)) {
  console.log('文件不存在:', imagePath);
  process.exit(1);
}

const form = new FormData();
form.append('image', fs.createReadStream(imagePath));

axios.post('http://localhost:3000/api/ocr/recognize', form, {
  headers: {
    ...form.getHeaders(),
    'Authorization': 'Bearer test'
  }
}).then(res => {
  console.log('成功:', JSON.stringify(res.data, null, 2));
}).catch(err => {
  console.log('失败:', err.response?.data || err.message);
});
