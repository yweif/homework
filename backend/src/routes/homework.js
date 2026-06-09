const express = require('express');
const auth = require('../middleware/auth');
const { getHomework, addHomework, updateHomework, deleteHomework, data } = require('../db');

const router = express.Router();

router.use(auth);

router.get('/', (req, res) => {
  const { subject_id, status, keyword, start_date, end_date } = req.query;
  const filters = { user_id: req.userId };
  
  if (subject_id) filters.subject_id = parseInt(subject_id);
  if (status) filters.status = status;
  if (keyword) filters.keyword = keyword;
  if (start_date) filters.start_date = start_date;
  if (end_date) filters.end_date = end_date;
  
  let list = getHomework(filters);
  
  list = list.map(hw => {
    const subject = data.subjects.find(s => s.id === hw.subject_id);
    return {
      ...hw,
      subject_name: subject ? subject.name : '未知学科'
    };
  });
  
  res.json({ data: list, total: list.length });
});

// 批量添加作业
router.post('/batch', (req, res) => {
  const { subject_id, title, content, start_date, end_date } = req.body;
  
  if (!subject_id || !title || !start_date || !end_date) {
    return res.status(400).json({ error: '学科、标题、开始日期和结束日期不能为空' });
  }

  const subject = data.subjects.find(s => s.id === parseInt(subject_id));
  if (!subject) {
    return res.status(400).json({ error: '学科不存在' });
  }

  const start = new Date(start_date);
  const end = new Date(end_date);
  const created = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const hw = {
      id: data.nextHomeworkId++,
      user_id: req.userId,
      subject_id: parseInt(subject_id),
      title: `${title} (${dateStr})`,
      content: content || '',
      status: '未开始',
      deadline: dateStr,
      start_time: null,
      complete_time: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    addHomework(hw);
    created.push(hw);
  }

  res.status(201).json({ 
    message: `成功创建 ${created.length} 个作业`, 
    count: created.length 
  });
});

router.post('/', (req, res) => {
  const { subject_id, title, content, deadline } = req.body;
  
  if (!subject_id || !title) {
    return res.status(400).json({ error: '学科和标题不能为空' });
  }

  const hw = {
    id: data.nextHomeworkId++,
    user_id: req.userId,
    subject_id: parseInt(subject_id),
    title,
    content: content || '',
    status: '未开始',
    deadline: deadline || null,
    start_time: null,
    complete_time: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  addHomework(hw);
  res.status(201).json({ id: hw.id, message: '作业创建成功' });
});

router.put('/:id', (req, res) => {
  const { subject_id, title, content, deadline } = req.body;
  const homeworkId = parseInt(req.params.id);

  const hw = data.homework.find(h => h.id === homeworkId && h.user_id === req.userId);
  if (!hw) {
    return res.status(404).json({ error: '作业不存在或无权限' });
  }

  const subject = data.subjects.find(s => s.id === parseInt(subject_id));
  if (!subject) {
    return res.status(400).json({ error: '学科不存在' });
  }

  updateHomework(homeworkId, {
    subject_id: parseInt(subject_id),
    title,
    content,
    deadline,
    updated_at: new Date().toISOString()
  });
  
  res.json({ message: '作业更新成功' });
});

router.delete('/:id', (req, res) => {
  const homeworkId = parseInt(req.params.id);
  const hw = data.homework.find(h => h.id === homeworkId && h.user_id === req.userId);
  
  if (!hw) {
    return res.status(404).json({ error: '作业不存在或无权限' });
  }

  deleteHomework(homeworkId);
  res.json({ message: '作业删除成功' });
});

router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const homeworkId = parseInt(req.params.id);
  const now = new Date().toISOString();

  const hw = data.homework.find(h => h.id === homeworkId && h.user_id === req.userId);
  if (!hw) {
    return res.status(404).json({ error: '作业不存在或无权限' });
  }

  const updates = { status, updated_at: now };  
  
  if (status === '进行中' && hw.status === '未开始') {
    updates.start_time = now;
  } else if (status === '已完成' && hw.status === '进行中') {
    updates.complete_time = now;
  }

  updateHomework(homeworkId, updates);
  res.json({ message: '状态更新成功' });
});

module.exports = router;
