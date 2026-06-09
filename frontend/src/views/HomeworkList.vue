<template>
  <div class="homework-list">
    <el-header class="header">
      <h1>作业管理</h1>
      <div>
        <el-button type="primary" @click="showAddDialog">添加作业</el-button>
        <el-button type="success" @click="showBatchDialog">批量添加</el-button>
        <el-button type="warning" @click="showOcrDialog">OCR导入</el-button>
        <el-button @click="goToDashboard">返回看板</el-button>
      </div>
    </el-header>

    <el-main>
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
          <el-form-item label="关键词">
            <el-input v-model="filter.keyword" placeholder="搜索标题或内容" clearable />
          </el-form-item>
        </el-form>
      </el-card>

      <el-card>
        <el-table :data="homeworkList" style="width: 100%">
          <el-table-column prop="title" label="作业标题" />
          <el-table-column prop="subject_name" label="学科" width="100" />
          <el-table-column prop="content" label="内容" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{row}">
              <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="deadline" label="截止时间" width="180" />
          <el-table-column label="操作" width="200">
            <template #default="{row}">
              <el-button size="small" @click="editHomework(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteHomework(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-main>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑作业' : '添加作业'">
      <el-form :model="form" label-width="80px">
        <el-form-item label="学科">
          <el-select v-model="form.subject_id" placeholder="请选择学科">
            <el-option v-for="sub in subjects" :key="sub.id" :label="sub.name" :value="sub.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="截止时间">
          <el-date-picker v-model="form.deadline" type="datetime" placeholder="选择截止时间" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveHomework">保存</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="batchDialogVisible" title="批量添加作业">
      <el-form :model="batchForm" label-width="80px">
        <el-form-item label="学科">
          <el-select v-model="batchForm.subject_id" placeholder="请选择学科">
            <el-option v-for="sub in subjects" :key="sub.id" :label="sub.name" :value="sub.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题模板">
          <el-input v-model="batchForm.title" placeholder="如：数学作业" />
          <div class="form-tip">将自动添加日期后缀，如：数学作业 (2026-05-08)</div>
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="batchForm.content" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker v-model="batchForm.start_date" type="date" placeholder="选择开始日期" />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker v-model="batchForm.end_date" type="date" placeholder="选择结束日期" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBatchHomework">批量创建</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="ocrDialogVisible" title="OCR导入作业" width="80%">
<el-upload
  ref="uploadRef"
  class="ocr-upload"
  action="/api/ocr/recognize"
  name="image"
  :headers="uploadHeaders()"
  :on-success="handleOcrSuccess"
  :on-error="handleOcrError"
  :before-upload="beforeOcrUpload"
  accept="image/*"
  :auto-upload="true"
>
        <el-button type="primary">选择图片</el-button>
        <template #tip>
          <div class="el-upload__tip">支持 jpg、png 格式图片，将自动识别作业内容</div>
        </template>
      </el-upload>

      <div v-if="ocrResult.text" class="ocr-result">
        <h3>OCR识别结果：</h3>
        <el-input type="textarea" :rows="4" v-model="ocrResult.text" disabled />
      </div>

      <div v-if="ocrResult.homeworkList && ocrResult.homeworkList.length > 0">
        <h3>识别到的作业列表：</h3>
        <el-table :data="ocrResult.homeworkList" style="width: 100%">
          <el-table-column prop="subject" label="学科" width="100" />
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="content" label="内容" show-overflow-tooltip />
          <el-table-column prop="deadline" label="截止日期" width="120" />
          <el-table-column label="操作" width="250">
            <template #default="{row, $index}">
              <el-button size="small" @click="addOcrHomework(row)">添加</el-button>
              <el-button size="small" @click="editOcrHomework($index)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteOcrHomework($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-dialog v-model="ocrEditVisible" title="编辑OCR作业" append-to-body>
        <el-form :model="ocrEditForm" label-width="80px">
          <el-form-item label="学科">
            <el-select v-model="ocrEditForm.subject" placeholder="请选择学科">
              <el-option v-for="sub in subjects" :key="sub.id" :label="sub.name" :value="sub.name" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
          <el-form-item label="标题">
            <el-input v-model="ocrEditForm.title" />
          </el-form-item>
          <el-form-item label="内容">
            <el-input v-model="ocrEditForm.content" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item label="截止日期">
            <el-date-picker v-model="ocrEditForm.deadline" type="date" placeholder="选择日期" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="ocrEditVisible = false">取消</el-button>
          <el-button type="primary" @click="saveOcrEdit">保存</el-button>
        </template>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const homeworkList = ref([])
const subjects = ref([])
const filter = reactive({ subject_id: null, status: null, keyword: '' })
const dialogVisible = ref(false)
const batchDialogVisible = ref(false)
const ocrDialogVisible = ref(false)
const ocrEditVisible = ref(false)
const isEdit = ref(false)
const form = reactive({ id: null, subject_id: null, title: '', content: '', deadline: '' })
const batchForm = reactive({ subject_id: null, title: '', content: '', start_date: null, end_date: null })
const ocrResult = reactive({ text: '', homeworkList: [] })
const ocrEditForm = reactive({ index: null, subject: '', title: '', content: '', deadline: null })
const uploadRef = ref(null)

const showOcrDialog = () => {
  ocrResult.text = ''
  ocrResult.homeworkList = []
  ocrDialogVisible.value = true
}

const uploadHeaders = () => {
  return {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
}

const handleOcrSuccess = (response, file, fileList) => {
  if (response.success) {
    ocrResult.text = response.text
    ocrResult.homeworkList = response.homeworkList || []
    ElMessage.success(`识别到 ${ocrResult.homeworkList.length} 个作业`)
  } else {
    ElMessage.error(response.error || 'OCR识别失败')
  }
}

const handleOcrError = (error, file, fileList) => {
  ElMessage.error('上传失败，请重试')
}

const beforeOcrUpload = (rawFile) => {
  const isImage = rawFile.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('请上传图片格式文件!')
    return false
  }
  return true
}

const addOcrHomework = async (row) => {
  try {
    const subject = subjects.value.find(s => s.name === row.subject)
    const hw = {
      subject_id: subject ? subject.id : subjects.value.find(s => s.name === '其他')?.id || 6,
      title: row.title,
      content: row.content,
      deadline: row.deadline
    }
    await axios.post('/api/homework', hw)
    ElMessage.success('添加成功')
    loadHomework()
  } catch (error) {
    ElMessage.error('添加失败')
  }
}

const editOcrHomework = (index) => {
  const row = ocrResult.homeworkList[index]
  ocrEditForm.index = index
  ocrEditForm.subject = row.subject
  ocrEditForm.title = row.title
  ocrEditForm.content = row.content
  ocrEditForm.deadline = row.deadline ? new Date(row.deadline) : null
  ocrEditVisible.value = true
}

const saveOcrEdit = () => {
  const index = ocrEditForm.index
  if (index !== null) {
    ocrResult.homeworkList[index] = {
      ...ocrResult.homeworkList[index],
      subject: ocrEditForm.subject,
      title: ocrEditForm.title,
      content: ocrEditForm.content,
      deadline: ocrEditForm.deadline
    }
    ElMessage.success('修改成功')
  }
  ocrEditVisible.value = false
}

const deleteOcrHomework = (index) => {
  ocrResult.homeworkList.splice(index, 1)
  ElMessage.success('删除成功')
}

const showBatchDialog = () => {
  batchForm.subject_id = null
  batchForm.title = ''
  batchForm.content = ''
  batchForm.start_date = null
  batchForm.end_date = null
  batchDialogVisible.value = true
}

const saveBatchHomework = async () => {
  try {
    if (!batchForm.subject_id || !batchForm.title || !batchForm.start_date || !batchForm.end_date) {
      ElMessage.warning('请填写完整信息')
      return
    }
    await axios.post('/api/homework/batch', batchForm)
    ElMessage.success('批量创建成功')
    batchDialogVisible.value = false
    loadHomework()
  } catch (error) {
    ElMessage.error('批量创建失败')
  }
}

const loadHomework = async () => {
  try {
    const params = {}
    if (filter.subject_id) params.subject_id = filter.subject_id
    if (filter.status) params.status = filter.status
    if (filter.keyword) params.keyword = filter.keyword
    
    const res = await axios.get('/api/homework', { params })
    homeworkList.value = res.data.data
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

const statusType = (status) => {
  const map = { '未开始': 'info', '进行中': 'warning', '已完成': 'success' }
  return map[status] || 'info'
}

const showAddDialog = () => {
  isEdit.value = false
  form.id = null
  form.subject_id = null
  form.title = ''
  form.content = ''
  form.deadline = ''
  dialogVisible.value = true
}

const editHomework = (row) => {
  isEdit.value = true
  form.id = row.id
  form.subject_id = row.subject_id
  form.title = row.title
  form.content = row.content
  form.deadline = row.deadline
  dialogVisible.value = true
}

const saveHomework = async () => {
  try {
    if (isEdit.value) {
      await axios.put(`/api/homework/${form.id}`, form)
      ElMessage.success('更新成功')
    } else {
      await axios.post('/api/homework', form)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadHomework()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const deleteHomework = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个作业吗？', '提示', {
      type: 'warning'
    })
    await axios.delete(`/api/homework/${id}`)
    ElMessage.success('删除成功')
    loadHomework()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const goToDashboard = () => router.push('/')

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

.filter-card {
  margin-bottom: 20px;
}
</style>
