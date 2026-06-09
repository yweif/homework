const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
require('dotenv').config();
const { initDatabase } = require('./db');
const { processImage } = require('./ocr');
const auth = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const homeworkRoutes = require('./routes/homework');
const subjectRoutes = require('./routes/subjects');

const app = express();
const PORT = process.env.PORT || 3000;

// 配置图片上传
const upload = multer({ dest: 'uploads/' });

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/subjects', subjectRoutes);

app.post('/api/ocr/recognize', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片' });
    }
    
    const { text, homeworkList } = await processImage(req.file.path);
    
    res.json({
      success: true,
      text,
      homeworkList
    });
  } catch (error) {
    console.error('OCR识别失败:', error);
    res.status(500).json({ error: 'OCR识别失败: ' + error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  });
}).catch(err => {
  console.error('启动失败:', err);
  process.exit(1);
});
