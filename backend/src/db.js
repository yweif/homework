const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, '../../homework.json');

let data = {
  users: [],
  subjects: [
    { id: 1, name: '语文', description: '语文作业' },
    { id: 2, name: '数学', description: '数学作业' },
    { id: 3, name: '英语', description: '英语作业' },
    { id: 4, name: '物理', description: '物理作业' },
    { id: 5, name: '化学', description: '化学作业' }
  ],
  homework: [],
  nextUserId: 1,
  nextSubjectId: 6,
  nextHomeworkId: 1
};

function loadData() {
  if (fs.existsSync(dbPath)) {
    const raw = fs.readFileSync(dbPath, 'utf8');
    data = JSON.parse(raw);
  }
}

function saveData() {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

loadData();

async function initDatabase() {
  console.log('数据库初始化成功');
  return Promise.resolve();
}

function findUserByUsername(username) {
  return data.users.find(u => u.username === username);
}

function findUserById(id) {
  return data.users.find(u => u.id === id);
}

function addUser(user) {
  data.users.push(user);
  saveData();
}

function getSubjects() {
  return data.subjects;
}

function addSubject(subject) {
  data.subjects.push(subject);
  saveData();
}

function deleteSubject(id) {
  data.subjects = data.subjects.filter(s => s.id !== id);
  saveData();
}

function getHomework(filters = {}) {
  let result = data.homework;
  
  if (filters.user_id) {
    result = result.filter(h => h.user_id === filters.user_id);
  }
  if (filters.subject_id) {
    result = result.filter(h => h.subject_id === filters.subject_id);
  }
  if (filters.status) {
    result = result.filter(h => h.status === filters.status);
  }
  if (filters.keyword) {
    result = result.filter(h => 
      h.title.includes(filters.keyword) || 
      (h.content && h.content.includes(filters.keyword))
    );
  }
  if (filters.start_date) {
    result = result.filter(h => h.deadline && h.deadline >= filters.start_date);
  }
  if (filters.end_date) {
    result = result.filter(h => h.deadline && h.deadline <= filters.end_date);
  }
  
  return result;
}

function addHomework(hw) {
  data.homework.push(hw);
  saveData();
}

function updateHomework(id, updates) {
  const hw = data.homework.find(h => h.id === id);
  if (hw) {
    Object.assign(hw, updates);
    saveData();
  }
  return hw;
}

function deleteHomework(id) {
  data.homework = data.homework.filter(h => h.id !== id);
  saveData();
}

module.exports = {
  data,
  findUserByUsername,
  findUserById,
  addUser,
  getSubjects,
  addSubject,
  deleteSubject,
  getHomework,
  addHomework,
  updateHomework,
  deleteHomework,
  saveData,
  initDatabase
};
