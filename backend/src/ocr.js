const tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

async function recognizeText(imagePath) {
  try {
    console.log('开始OCR识别:', imagePath);
    const { data: { text } } = await tesseract.recognize(imagePath, 'chi_sim+eng', {
      logger: m => console.log(m)
    });
    console.log('OCR识别完成，文本长度:', text.length);
    return text.trim();
  } catch (error) {
    console.error('OCR识别失败:', error.message);
    throw error;
  }
}

// 智能作业内容解析
function parseHomeworkText(text) {
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const subjects = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治'];
  const results = [];
  
  let currentSubject = '其他';
  let currentTitle = '';
  let currentContent = '';
  let currentDeadline = null;
  let foundSubjectLine = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 检测学科标题（通常在大写或单独一行）
    const foundSubject = subjects.find(sub => line.includes(sub));
    if (foundSubject) {
      // 保存上一个作业
      if (currentTitle && currentSubject !== '其他') {
        results.push({
          subject: currentSubject,
          title: currentTitle.substring(0, 50),
          content: (currentContent + ' ' + currentTitle).trim(),
          deadline: currentDeadline
        });
      }
      
      // 开始新的学科
      currentSubject = foundSubject;
      currentTitle = '';
      currentContent = '';
      currentDeadline = null;
      foundSubjectLine = true;
      continue;
    }

    // 检测日期（支持多种格式）
    const datePatterns = [
      /(\d{1,2})[月日号]/,
      /(\d{1,2})[./](\d{1,2})/,
      /(今天|明天|后天)/,
      /(周|星期)[一二三四五六日天]/
    ];
    
    let isDateLine = false;
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        const now = new Date();
        let month = now.getMonth() + 1;
        let day = null;
        
        if (match[1] && match[2]) {
          // 格式：5/8 或 5.8
          month = parseInt(match[1]);
          day = parseInt(match[2]);
        } else if (match[1] && line.includes('月')) {
          // 格式：5月8号
          day = parseInt(match[1]);
        } else if (match[1] === '今天') {
          day = now.getDate();
        } else if (match[1] === '明天') {
          day = now.getDate() + 1;
        } else if (match[1] === '后天') {
          day = now.getDate() + 2;
        } else if (match[1]) {
          // 周几推算（简化版）
          const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
          const targetDay = weekDays.indexOf(match[1]);
          if (targetDay >= 0) {
            const todayDay = now.getDay();
            let diff = targetDay - todayDay;
            if (diff <= 0) diff += 7;
            const targetDate = new Date(now);
            targetDate.setDate(now.getDate() + diff);
            month = targetDate.getMonth() + 1;
            day = targetDate.getDate();
          }
        }
        
        if (month && day) {
          currentDeadline = `${now.getFullYear()}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        
        isDateLine = true;
        currentContent += line + ' ';
        
        // 如果这一行有日期，可能是作业的截止行，保存作业
        if (currentTitle) {
          results.push({
            subject: currentSubject,
            title: currentTitle.substring(0, 50),
            content: (currentContent + ' ' + currentTitle).trim(),
            deadline: currentDeadline
          });
          currentTitle = '';
          currentContent = '';
          currentDeadline = null;
        }
        break;
      }
    }
    
    if (!isDateLine && !foundSubjectLine) {
      // 可能是作业标题或内容
      if (!currentTitle && line.length > 2) {
        currentTitle = line;
      } else {
        currentContent += line + ' ';
      }
    }
    
    foundSubjectLine = false;
  }
  
  // 保存最后一个作业
  if (currentTitle && currentSubject !== '其他') {
    results.push({
      subject: currentSubject,
      title: currentTitle.substring(0, 50),
      content: (currentContent + ' ' + currentTitle).trim(),
      deadline: currentDeadline
    });
  }
  
  return results.length > 0 ? results : [{
    subject: '其他',
    title: text.substring(0, 50),
    content: text,
    deadline: null
  }];
}

async function processImage(imagePath) {
  const text = await recognizeText(imagePath);
  const homeworkList = parseHomeworkText(text);
  
  // 清理上传文件
  try {
    fs.unlinkSync(imagePath);
  } catch (e) {}
  
  return { text, homeworkList };
}

module.exports = { recognizeText, parseHomeworkText, processImage };
