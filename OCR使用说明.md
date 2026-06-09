# OCR 功能使用说明

## 环境要求

### 1. 安装 Tesseract OCR 引擎

**Windows:**
1. 下载安装包：https://github.com/UB-Mannheim/tesseract/wiki
2. 安装时勾选"中文语言包（chi_sim）"
3. 将 Tesseract 添加到系统 PATH（如 `C:\Program Files\Tesseract-OCR`）

**验证安装：**
```bash
tesseract --version
```

### 2. 后端依赖已安装
```bash
cd C:\homework\backend
npm install tesseract.js multer --save
```

## 使用方法

1. 访问 http://localhost:8080 并登录
2. 进入"作业管理"页面
3. 点击"OCR导入"按钮（黄色按钮）
4. 在弹窗中点击"选择图片"按钮
5. 上传 task1.jpg、task2.jpg 或 task3.jpg
6. 系统自动识别图片中的作业内容
7. 识别结果以列表展示，每个作业右侧有3个按钮：
   - **添加**：确认添加该作业到系统
   - **编辑**：修改作业的学科、标题、内容、截止日期
   - **删除**：删除当前这条识别结果

## 识别规则

- 自动检测学科：语文、数学、英语、物理、化学、生物、历史、地理、政治
- 未识别到学科的作业归类为"其他"
- 尝试从文本中提取日期（如"5月8号"）
- 支持中英文混合识别

## 示例图片

项目根目录提供了3张示例图片：
- `task1.jpg` - 数学作业示例
- `task2.jpg` - 语文作业示例  
- `task3.jpg` - 英语作业示例

## 故障排查

### OCR识别失败
1. 确认 Tesseract 已安装并添加到 PATH
2. 重启后端服务
3. 检查后端日志：`tesseract 未找到` 说明未安装

### 识别结果不准确
1. 图片需清晰，文字端正
2. 可点击"编辑"手动调整
3. 支持中英文混合，但建议使用标准字体

### 上传失败
1. 确认后端已启动（http://localhost:3000/health）
2. 图片格式需为 jpg、png
3. 图片大小建议不超过 5MB

## 后端接口

**POST** `/api/ocr/recognize`
- 参数：image（form-data 文件）
- 返回：{ success, text, homeworkList }
- 需要认证：Bearer Token

## 技术说明

- OCR 引擎：Tesseract.js（调用系统 Tesseract）
- 语言包：chi_sim（简体中文）+ eng（英文）
- 文件上传：multer 中间件
- 文本解析：基于规则的分行解析
