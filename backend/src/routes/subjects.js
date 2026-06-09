const express = require('express');
const auth = require('../middleware/auth');
const { getSubjects, addSubject, deleteSubject, data } = require('../db');

const router = express.Router();

router.use(auth);

router.get('/', (req, res) => {
  res.json({ data: getSubjects() });
});

router.post('/', (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: '学科名称不能为空' });
  }

  const subject = {
    id: data.nextSubjectId++,
    name,
    description: description || ''
  };
  
  addSubject(subject);
  res.status(201).json({ id: subject.id, message: '学科添加成功' });
});

router.delete('/:id', (req, res) => {
  const subjectId = parseInt(req.params.id);
  deleteSubject(subjectId);
  res.json({ message: '学科删除成功' });
});

module.exports = router;
