<template>
  <div class="dashboard">
    <el-header class="header">
      <h1>回家作业看板</h1>
      <div>
        <el-button @click="goToHomework">作业管理</el-button>
        <el-button @click="handleLogout">退出登录</el-button>
      </div>
    </el-header>
    
    <el-main>
      <el-card class="calendar-card">
        <template #header>
          <div class="calendar-header">
            <el-button @click="prevMonth" size="small" icon="ArrowLeft"></el-button>
            <span class="calendar-title">{{ currentYear }}年{{ currentMonth }}月</span>
            <el-button @click="nextMonth" size="small" icon="ArrowRight"></el-button>
          </div>
        </template>
        
        <div class="calendar">
          <div class="calendar-week">
            <div v-for="day in weekDays" :key="day" class="week-day">{{ day }}</div>
          </div>
          <div class="calendar-days">
            <div 
              v-for="(day, index) in calendarDays" 
              :key="index"
              class="calendar-day"
              :class="dayClass(day)"
              @click="selectDate(day)"
            >
              <div class="day-number">{{ day.day }}</div>
              <div class="day-lunar">{{ day.lunar.lunarDay }}</div>
              <div v-if="day.holiday" class="day-holiday">{{ day.holiday }}</div>
              <div v-for="hw in getDayHomework(day.date)" :key="hw.id" class="day-homework">
                {{ hw.title }}
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <el-row :gutter="20" class="stats-row">
        <el-col :span="6" v-for="stat in stats" :key="stat.label">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-value" :style="{color: stat.color}">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-card class="filter-card">
        <el-form :inline="true" :model="filter">
          <el-form-item label="学科">
            <el-select v-model="filter.subject_id" placeholder="全部" clearable>
              <el-option v-for="sub in subjects" :key="sub.id" :label="sub.name" :value="sub.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filter.status" placeholder="全部" clearable>
              <el-option label="未开始" value="未开始" />
              <el-option label="进行中" value="进行中" />
              <el-option label="已完成" value="已完成" />
            </el-select>
          </el-form-item>
          <el-form-item label="开始日期">
            <el-date-picker v-model="filter.start_date" type="date" placeholder="开始日期" clearable />
          </el-form-item>
          <el-form-item label="结束日期">
            <el-date-picker v-model="filter.end_date" type="date" placeholder="结束日期" clearable />
          </el-form-item>
        </el-form>
      </el-card>

      <el-card>
        <el-table :data="homeworkList" style="width: 100%">
          <el-table-column prop="title" label="作业标题" />
          <el-table-column prop="subject_name" label="学科" width="100" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{row}">
              <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="deadline" label="截止时间" width="180" />
          <el-table-column label="操作" width="150">
            <template #default="{row}">
              <el-button size="small" @click="updateStatus(row)">更新状态</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getMonthCalendar, formatDate } from '../utils/calendar'

const router = useRouter()
const homeworkList = ref([])
const subjects = ref([])
const filter = reactive({ subject_id: null, status: null, start_date: null, end_date: null })
const stats = ref([
  { label: '全部作业', value: 0, color: '#409eff' },
  { label: '未开始', value: 0, color: '#909399' },
  { label: '进行中', value: 0, color: '#e6a23c' },
  { label: '已完成', value: 0, color: '#67c23a' }
])

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const calendarDays = computed(() => {
  return getMonthCalendar(currentYear.value, currentMonth.value)
})

const dayClass = (day) => {
  return {
    'other-month': !day.isCurrentMonth,
    'today': day.isToday
  }
}

const loadHomework = async () => {
  try {
    const params = {}
    if (filter.subject_id) params.subject_id = filter.subject_id
    if (filter.status) params.status = filter.status
    if (filter.start_date) params.start_date = formatDate(new Date(filter.start_date))
    if (filter.end_date) params.end_date = formatDate(new Date(filter.end_date))
    
    const res = await axios.get('/api/homework', { params })
    homeworkList.value = res.data.data
    updateStats()
  } catch (error) {
    ElMessage.error('加载失败')
  }
}

const loadSubjects = async () => {
  try {
    const res = await axios.get('/api/subjects')
    subjects.value = res.data.data
  } catch (error) {
    console.error('加载学科失败', error)
  }
}

const updateStats = () => {
  const all = homeworkList.value.length
  const notStarted = homeworkList.value.filter(h => h.status === '未开始').length
  const inProgress = homeworkList.value.filter(h => h.status === '进行中').length
  const completed = homeworkList.value.filter(h => h.status === '已完成').length
  
  stats.value = [
    { label: '全部作业', value: all, color: '#409eff' },
    { label: '未开始', value: notStarted, color: '#909399' },
    { label: '进行中', value: inProgress, color: '#e6a23c' },
    { label: '已完成', value: completed, color: '#67c23a' }
  ]
}

const statusType = (status) => {
  const map = { '未开始': 'info', '进行中': 'warning', '已完成': 'success' }
  return map[status] || 'info'
}

const updateStatus = async (row) => {
  const statusMap = { '未开始': '进行中', '进行中': '已完成' }
  if (!statusMap[row.status]) return
  
  try {
    await axios.patch(`/api/homework/${row.id}/status`, { status: statusMap[row.status] })
    ElMessage.success('状态更新成功')
    loadHomework()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

const getDayHomework = (date) => {
  const dateStr = formatDate(date)
  return homeworkList.value.filter(hw => {
    return hw.deadline && hw.deadline.startsWith(dateStr)
  })
}

const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const selectDate = (day) => {
  console.log('选中日期:', day.date)
}

const goToHomework = () => router.push('/homework')
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  delete axios.defaults.headers.common['Authorization']
  router.push('/login')
}

watch(filter, () => loadHomework(), { deep: true })

onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }
  loadSubjects()
  loadHomework()
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-bottom: 1px solid #e6e6e6;
  margin-bottom: 20px;
}

.calendar-card {
  margin-bottom: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-title {
  font-size: 16px;
  font-weight: bold;
}

.calendar {
  font-size: 12px;
}

.calendar-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  margin-bottom: 8px;
}

.week-day {
  padding: 8px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  min-height: 80px;
  border: 1px solid #ebeef5;
  padding: 4px;
  cursor: pointer;
  overflow: hidden;
}

.calendar-day.other-month {
  background-color: #f5f7fa;
  opacity: 0.5;
}

.calendar-day.today {
  background-color: #ecf5ff;
  border-color: #409eff;
}

.day-number {
  font-weight: bold;
  font-size: 14px;
}

.day-lunar {
  color: #909399;
  font-size: 10px;
}

.day-holiday {
  color: #f56c6c;
  font-size: 10px;
}

.day-homework {
  background-color: #409eff;
  color: white;
  padding: 2px 4px;
  margin-top: 2px;
  border-radius: 2px;
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats-row {
  margin: 20px 0;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
}

.stat-label {
  color: #909399;
  margin-top: 8px;
}

.filter-card {
  margin-bottom: 20px;
}
</style>
