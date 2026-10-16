<template>
  <div class="project-container">
    <el-container direction="vertical">
      <AppHeader />

      <el-main class="main">
        <div class="page-header">
          <h2>项目管理</h2>
          <el-button type="primary" @click="showCreateDialog">
            <el-icon><Plus /></el-icon>
            创建项目
          </el-button>
        </div>

        <!-- 项目列表 -->
        <el-table :data="projects" v-loading="loading" stripe style="width: 100%">
          <el-table-column prop="name" label="项目名称" min-width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="startDate" label="开始日期" width="120" />
          <el-table-column prop="plannedCompletionDate" label="计划完成日期" width="130" />
          <el-table-column label="操作" width="420" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="viewMembers(row)">查看成员</el-button>
              <el-button type="primary" link @click="viewDetail(row)">查看详情</el-button>
              <el-button v-if="manageableProjectIds.has(row.id)" type="primary" link :disabled="busyProjectIds.has(row.id) || submitting || deletingId !== null" @click="showEditDialog(row)">编辑</el-button>
              <el-button v-if="manageableProjectIds.has(row.id)" type="danger" link :loading="deletingId === row.id" :disabled="busyProjectIds.has(row.id) || submitting || deletingId !== null" @click="handleDelete(row)">删除</el-button>
              <el-button
                v-if="row.status === 'COMPLETED'"
                type="success"
                size="small"
                :loading="viewingReportProjectId === row.id"
                @click="viewReport(row)"
              >
                <el-icon style="margin-right: 4px"><View /></el-icon>
                查看报告
              </el-button>
              <el-button
                v-else
                type="warning"
                size="small"
                @click="openUploadDrawer(row)"
              >
                <el-icon style="margin-right: 4px"><DataAnalysis /></el-icon>
                风险评估
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 创建项目对话框 -->
        <el-dialog
          v-model="createDialogVisible"
          :title="editingProject ? '编辑项目' : '创建项目'"
          width="650px"
          :close-on-click-modal="false"
          :show-close="!submitting"
          :close-on-press-escape="!submitting"
        >
          <el-form
            ref="formRef"
            :model="projectForm"
            :rules="formRules"
            label-width="120px"
          >
            <el-form-item label="所属企业" prop="enterpriseId">
              <el-select
                v-model="projectForm.enterpriseId"
                placeholder="请选择所属企业"
                style="width: 100%"
                filterable
                :disabled="!!editingProject"
              >
                <el-option
                  v-for="item in enterprises"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="projectForm.name" placeholder="请输入项目名称" />
            </el-form-item>
            <el-form-item label="评估类型">
              <el-select v-model="projectForm.type" placeholder="请选择评估类型" style="width: 100%">
                <el-option label="常规评估" value="REGULAR" />
                <el-option label="专项评估" value="SPECIAL" />
              </el-select>
            </el-form-item>
            <el-form-item label="项目描述">
              <el-input
                v-model="projectForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入项目描述"
              />
            </el-form-item>
            <el-form-item label="所属行业" prop="industry">
              <el-select v-model="projectForm.industry" placeholder="请选择所属行业" style="width: 100%">
                <el-option
                  v-for="item in industryOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="所属区域" prop="region">
              <el-select v-model="projectForm.region" placeholder="请选择所属区域" style="width: 100%">
                <el-option
                  v-for="item in regionOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="面向用户" prop="orientedUser">
              <el-select v-model="projectForm.orientedUser" placeholder="请选择面向用户" style="width: 100%">
                <el-option
                  v-for="item in orientedUserOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="开始日期">
                  <el-date-picker
                    v-model="projectForm.startDate"
                    type="date"
                    placeholder="选择开始日期"
                    style="width: 100%"
                    value-format="YYYY-MM-DD"
                    :clearable="!editingProject"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="计划完成日期" prop="plannedCompletionDate">
                  <el-date-picker
                    v-model="projectForm.plannedCompletionDate"
                    type="date"
                    placeholder="选择计划完成日期"
                    style="width: 100%"
                    value-format="YYYY-MM-DD"
                    :clearable="!editingProject"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <template #footer>
            <el-button @click="createDialogVisible = false" :disabled="submitting">取消</el-button>
            <el-button type="primary" @click="handleCreate" :loading="submitting">{{ editingProject ? '保存修改' : '创建' }}</el-button>
          </template>
        </el-dialog>

        <!-- 成员列表对话框 -->
        <el-dialog
          v-model="membersDialogVisible"
          :title="`${currentProject?.name} - 成员列表`"
          width="600px"
        >
          <div class="members-header">
            <el-button type="primary" size="small" @click="showAddMemberDialog">
              <el-icon><Plus /></el-icon>
              添加成员
            </el-button>
          </div>
          <el-table :data="members" v-loading="membersLoading">
            <el-table-column label="姓名">
              <template #default="{ row }">
                {{ row.user?.fullName || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="邮箱">
              <template #default="{ row }">
                {{ row.user?.email || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="role" label="角色">
              <template #default="{ row }">
                <el-tag :type="getRoleType(row.role)">{{ getRoleLabel(row.role) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-dialog>

        <!-- 添加成员对话框 -->
        <el-dialog
          v-model="addMemberDialogVisible"
          title="添加成员"
          width="450px"
          :close-on-click-modal="false"
        >
          <el-form
            ref="addMemberFormRef"
            :model="addMemberForm"
            :rules="addMemberFormRules"
            label-width="100px"
          >
            <el-form-item label="用户邮箱" prop="email">
              <el-input
                v-model="addMemberForm.email"
                placeholder="请输入用户邮箱"
                style="width: 100%"
                clearable
              />
            </el-form-item>
            <el-form-item label="角色" prop="role">
              <el-select v-model="addMemberForm.role" placeholder="请选择角色" style="width: 100%">
                <el-option
                  v-for="item in projectRoleOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" link @click="searchUser" :loading="searchingUser">
                查询用户信息
              </el-button>
            </el-form-item>
            <el-form-item v-if="searchedUser" label="用户信息">
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="姓名">{{ searchedUser.fullName }}</el-descriptions-item>
                <el-descriptions-item label="邮箱">{{ searchedUser.email }}</el-descriptions-item>
              </el-descriptions>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="addMemberDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleAddMember" :loading="addingMember">添加</el-button>
          </template>
        </el-dialog>

        <!-- 项目详情对话框 -->
        <el-dialog
          v-model="detailDialogVisible"
          :title="`项目详情 - ${currentProject?.name}`"
          width="700px"
        >
          <el-descriptions :column="2" border v-if="currentProject">
            <el-descriptions-item label="项目名称">{{ currentProject.name }}</el-descriptions-item>
            <el-descriptions-item label="项目状态">
              <el-tag :type="getStatusType(currentProject.status)">{{ getStatusLabel(currentProject.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="所属行业">{{ getIndustryLabel(currentProject.industry) }}</el-descriptions-item>
            <el-descriptions-item label="所属区域">{{ getRegionLabel(currentProject.region) }}</el-descriptions-item>
            <el-descriptions-item label="面向用户">{{ getOrientedUserLabel(currentProject.orientedUser) }}</el-descriptions-item>
            <el-descriptions-item label="开始日期">{{ currentProject.startDate || '-' }}</el-descriptions-item>
            <el-descriptions-item label="计划完成日期">{{ currentProject.plannedCompletionDate || '-' }}</el-descriptions-item>
            <el-descriptions-item label="实际完成日期">{{ currentProject.actualCompletionDate || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(currentProject.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="项目描述" :span="2">{{ currentProject.description || '-' }}</el-descriptions-item>
          </el-descriptions>
          <template #footer>
            <el-button @click="detailDialogVisible = false">关闭</el-button>
          </template>
        </el-dialog>

        <!-- 文件上传抽屉 -->
        <el-drawer
          v-model="uploadDrawerVisible"
          :title="`上传文件评估 - ${currentProject?.name}`"
          size="50%"
          direction="rtl"
        >
          <div class="file-upload-container">
            <div
              class="upload-area"
              @click="triggerFileInput"
              @drop="handleDrop"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              :class="{ 'drag-over': isDragOver, 'uploading': hasUploadingFiles }"
            >
              <input ref="fileInputRef" type="file" @change="handleFileSelect" style="display: none" multiple />

              <div v-if="!hasUploadingFiles && uploadFiles.length === 0" class="upload-placeholder">
                <el-icon class="upload-icon"><UploadFilled /></el-icon>
                <p>点击选择文件或拖拽文件到此处</p>
                <p class="upload-hint">支持多文件上传，单个文件最大10MB</p>
              </div>

              <div v-if="uploadFiles.length > 0" class="file-list">
                <div
                  v-for="file in uploadFiles"
                  :key="file.id"
                  class="file-item"
                  :class="{
                    'uploading': file.status === 'uploading',
                    'success': file.status === 'success',
                    'error': file.status === 'error'
                  }"
                >
                  <div class="file-info">
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  </div>

                  <div class="file-progress">
                    <el-progress
                      :percentage="file.progress"
                      :status="file.status === 'error' ? 'exception' : file.status === 'success' ? 'success' : undefined"
                    />
                  </div>

                  <div class="file-actions">
                    <el-button v-if="file.status === 'error'" type="primary" size="small" @click="retryUploadFile(file)">
                      重试
                    </el-button>
                    <el-button v-if="file.status === 'success' || file.status === 'error'" type="danger" size="small" @click="removeFile(file.id)">
                      移除
                    </el-button>
                    <el-button v-if="file.status === 'uploading'" type="warning" size="small" @click="cancelUpload(file.id)">
                      取消
                    </el-button>
                  </div>

                  <div v-if="file.error" class="error-message">
                    {{ file.error }}
                  </div>
                </div>
              </div>
            </div>

            <div v-if="uploadFiles.length > 0" class="upload-controls">
              <el-button type="primary" @click="confirmAllUploads" :disabled="hasUploadingFiles || !hasSuccessFiles" :loading="isConfirming">
                {{ isConfirming ? '确认中...' : '确认上传所有文件' }}
              </el-button>
              <el-button @click="clearAllFiles" :disabled="hasUploadingFiles || isConfirming">
                清空列表
              </el-button>
            </div>

            <div v-if="uploadStats.total > 0" class="upload-stats">
              <p>总进度: {{ uploadStats.completed }}/{{ uploadStats.total }} 文件</p>
              <el-progress :percentage="overallProgress" />
            </div>
            <el-alert
              v-if="isAssessing"
              title="文件已提交，正在评估中，结果生成后将自动通知"
              type="info"
              show-icon
              class="assessing-alert"
            />
          </div>
        </el-drawer>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, UploadFilled, DataAnalysis, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { createProject, getAllProjects, getProjectMembers, addProjectMember, getAssessmentByProjectId, getProject, updateProject, deleteProject } from '@/api/project'
import { getAllEnterprises, getEnterpriseMembers } from '@/api/enterprise'
import { useUserStore } from '@/stores/user'
import { getUserByEmail } from '@/api/user'
import { uploadFileWithChunks, confirmFileUpload, deleteUploadFile, type UploadProgressInfo } from '@/api/fileUpload'
import type { Project, ProjectCreateRequest, ProjectUpdateRequest, ProjectMemberResponse, Enterprise, AddMemberRequest, UserResponse } from '@/types'
import {
  industryOptions,
  regionOptions,
  orientedUserOptions,
  projectRoleOptions
} from '@/types'
import AppHeader from '@/components/AppHeader.vue'

const router = useRouter()
const userStore = useUserStore()
const manageableProjectIds = ref(new Set<number>())
const busyProjectIds = ref(new Set<number>())
const editingProject = ref<Project | null>(null)
const formSnapshot = ref<ProjectCreateRequest | null>(null)
const deletingId = ref<number | null>(null)

// 状态
const loading = ref(false)
const submitting = ref(false)
const membersLoading = ref(false)
const projects = ref<Project[]>([])
const enterprises = ref<Enterprise[]>([])
const members = ref<ProjectMemberResponse[]>([])
const createDialogVisible = ref(false)
const membersDialogVisible = ref(false)
const addMemberDialogVisible = ref(false)
const currentProject = ref<Project | null>(null)
const formRef = ref<FormInstance>()
const addMemberFormRef = ref<FormInstance>()
const searchedUser = ref<UserResponse | null>(null)
const searchingUser = ref(false)
const addingMember = ref(false)

// 项目详情和文件上传状态
const detailDialogVisible = ref(false)
const uploadDrawerVisible = ref(false)
const fileInputRef = ref<HTMLInputElement>()
const viewingReportProjectId = ref<number | null>(null)

// 文件上传相关状态
interface UploadFile {
  id: number
  name: string
  size: number
  file: File
  progress: number
  status: 'waiting' | 'uploading' | 'success' | 'error'
  error: string | null
  uploadId: string | null
  assessmentId: number | null
}

const uploadFiles = ref<UploadFile[]>([])
const uploadAssessmentId = ref<number | null>(null)
const isDragOver = ref(false)
const isConfirming = ref(false)
const isAssessing = ref(false)
let fileIdCounter = 0
const uploadStats = reactive({
  total: 0,
  completed: 0,
  failed: 0
})
const maxFileSize = 10 * 1024 * 1024 // 10MB

// 计算属性 - 是否有文件正在分片上传中
const hasUploadingFiles = computed(() => {
  return uploadFiles.value.some(f => f.status === 'uploading')
})

// 计算属性
const overallProgress = computed(() => {
  if (uploadStats.total === 0) return 0
  return Math.round((uploadStats.completed / uploadStats.total) * 100)
})

const hasSuccessFiles = computed(() => {
  return uploadFiles.value.some(f => f.status === 'success')
})

// 表单数据
const projectForm = reactive<ProjectCreateRequest>({
  enterpriseId: 0,
  type: undefined,
  name: '',
  description: '',
  startDate: '',
  plannedCompletionDate: '',
  industry: '',
  region: '',
  orientedUser: ''
})

// 表单验证规则
const formRules = computed<FormRules>(() => ({
  enterpriseId: [
    { required: true, message: '请选择所属企业', trigger: 'change' }
  ],
  name: [
    { required: true, whitespace: true, message: '请输入项目名称', trigger: 'blur' }
  ],
  industry: [
    { required: !editingProject.value || !!formSnapshot.value?.industry, message: '请选择所属行业', trigger: 'change' }
  ],
  region: [
    { required: !editingProject.value || !!formSnapshot.value?.region, message: '请选择所属区域', trigger: 'change' }
  ],
  orientedUser: [
    { required: !editingProject.value || !!formSnapshot.value?.orientedUser, message: '请选择面向用户', trigger: 'change' }
  ],
  plannedCompletionDate: [{ validator: (_rule, value, callback) => {
    if (value && projectForm.startDate && value < projectForm.startDate) callback(new Error('计划完成日期不能早于开始日期'))
    else callback()
  }, trigger: 'change' }]
}))

// 添加成员表单（email用于搜索，searchedUserId用于提交）
const addMemberForm = reactive({
  email: '',
  role: ''
})
const searchedUserId = ref<number | null>(null)

// 添加成员表单验证规则
const addMemberFormRules: FormRules = {
  email: [
    { required: true, message: '请输入用户邮箱', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 获取项目列表
const fetchProjects = async () => {
  loading.value = true
  try {
    const res = await getAllProjects()
    projects.value = res.data || []
    manageableProjectIds.value = new Set()
    busyProjectIds.value = new Set()
    if (userStore.user) {
      const [projectPermissions, enterprisePermissions, assessments] = await Promise.all([
        Promise.allSettled(projects.value.map(async project => {
          const response = await getProjectMembers(project.id, true)
          return response.data.some(member => member.user?.id === userStore.user?.id && member.role.toLowerCase() === 'project_admin') ? project.id : null
        })),
        Promise.allSettled([...new Set(projects.value.map(project => project.enterpriseId))].map(async id => {
          const response = await getEnterpriseMembers(id, true)
          return response.data.some(member => member.user?.id === userStore.user?.id && member.role.toLowerCase() === 'admin') ? id : null
        })),
        Promise.allSettled(projects.value.map(async project => {
          const response = await getAssessmentByProjectId(project.id, true)
          return response.data && ['UPLOADING', 'TO_BE_ASSESSED', 'ASSESSING'].includes(response.data.status) ? project.id : null
        }))
      ])
      const enterpriseAdmins = new Set(enterprisePermissions.flatMap(result => result.status === 'fulfilled' && result.value !== null ? [result.value] : []))
      manageableProjectIds.value = new Set([
        ...projectPermissions.flatMap(result => result.status === 'fulfilled' && result.value !== null ? [result.value] : []),
        ...projects.value.filter(project => enterpriseAdmins.has(project.enterpriseId)).map(project => project.id)
      ])
      busyProjectIds.value = new Set(assessments.flatMap(result => result.status === 'fulfilled' && result.value !== null ? [result.value] : []))
    }
  } catch (error) {
    console.error('获取项目列表失败', error)
  } finally {
    loading.value = false
  }
}

// 获取企业列表
const fetchEnterprises = async () => {
  try {
    const res = await getAllEnterprises()
    enterprises.value = res.data || []
  } catch (error) {
    console.error('获取企业列表失败', error)
  }
}

// 显示创建对话框
const showCreateDialog = () => {
  if (submitting.value) return
  editingProject.value = null
  formSnapshot.value = null
  resetForm()
  createDialogVisible.value = true
}

const showEditDialog = async (project: Project) => {
  if (submitting.value || busyProjectIds.value.has(project.id)) return
  submitting.value = true
  try {
    const response = await getProject(project.id)
    resetForm()
    const data = response.data
    Object.assign(projectForm, {
      enterpriseId: data.enterpriseId, name: data.name, type: data.type ?? undefined,
      description: data.description ?? '', startDate: data.startDate ?? '', plannedCompletionDate: data.plannedCompletionDate ?? '',
      industry: data.industry ?? '', region: data.region ?? '', orientedUser: data.orientedUser ?? ''
    })
    editingProject.value = data
    formSnapshot.value = { ...projectForm }
    createDialogVisible.value = true
  } catch (error) { console.error('读取项目详情失败', error) }
  finally { submitting.value = false }
}

const handleDelete = async (project: Project) => {
  if (deletingId.value !== null || busyProjectIds.value.has(project.id)) return
  deletingId.value = project.id
  try {
    await ElMessageBox.confirm(`确定删除项目“${project.name}”吗？项目成员关系、评估记录和关联结果也会删除，关联文件将在后台清理。此操作无法撤销。`, '删除项目', {
      type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消', confirmButtonClass: 'el-button--danger'
    })
  } catch { deletingId.value = null; return }
  try {
    await deleteProject(project.id)
    projects.value = projects.value.filter(item => item.id !== project.id)
    if (currentProject.value?.id === project.id) {
      detailDialogVisible.value = false; membersDialogVisible.value = false; addMemberDialogVisible.value = false
      uploadDrawerVisible.value = false; resetUploadState(); currentProject.value = null; members.value = []
    }
    ElMessage.success('项目已删除，关联文件将在后台清理')
    await fetchProjects()
  } catch (error) { console.error('删除项目失败', error) }
  finally { deletingId.value = null }
}

// 重置表单
const resetForm = () => {
  Object.assign(projectForm, {
    enterpriseId: 0,
    type: undefined,
    name: '',
    description: '',
    startDate: '',
    plannedCompletionDate: '',
    industry: '',
    region: '',
    orientedUser: ''
  })
  formRef.value?.clearValidate()
}

// 创建项目
const handleCreate = async () => {
  if (submitting.value) return
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (editingProject.value) {
      const changes = Object.fromEntries(Object.entries(projectForm).filter(([key, value]) =>
        key !== 'enterpriseId' && value != null && value !== formSnapshot.value?.[key as keyof ProjectCreateRequest])) as ProjectUpdateRequest
      if (Object.keys(changes).length === 0) { ElMessage.info('没有需要保存的修改'); return }
      const response = await updateProject(editingProject.value.id, changes)
      projects.value = projects.value.map(item => item.id === response.data.id ? response.data : item)
      if (currentProject.value?.id === response.data.id) currentProject.value = response.data
      ElMessage.success('项目修改成功')
    } else {
      await createProject(projectForm)
      ElMessage.success('项目创建成功')
    }
    createDialogVisible.value = false
    await fetchProjects()
  } catch (error) {
    console.error('创建项目失败', error)
  } finally {
    submitting.value = false
  }
}

// 查看成员
const viewMembers = async (project: Project) => {
  currentProject.value = project
  membersDialogVisible.value = true
  membersLoading.value = true
  try {
    const res = await getProjectMembers(project.id)
    members.value = res.data || []
  } catch (error) {
    console.error('获取成员列表失败', error)
  } finally {
    membersLoading.value = false
  }
}

// 获取行业标签
const getIndustryLabel = (industry: string) => {
  const item = industryOptions.find(opt => opt.value === industry)
  return item?.label || industry || '-'
}

// 获取区域标签
const getRegionLabel = (region: string) => {
  const item = regionOptions.find(opt => opt.value === region)
  return item?.label || region || '-'
}

// 获取面向用户标签
const getOrientedUserLabel = (orientedUser: string) => {
  const item = orientedUserOptions.find(opt => opt.value === orientedUser)
  return item?.label || orientedUser || '-'
}

// 获取状态标签
const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    'IN_PROGRESS': '进行中',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消',
    'PENDING': '待开始',
    'ASSESSING': '正在评估中'
  }
  return map[status] || status
}

// 获取状态类型
const getStatusType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    'IN_PROGRESS': 'primary',
    'COMPLETED': 'success',
    'CANCELLED': 'info',
    'PENDING': 'warning',
    'ASSESSING': 'warning'
  }
  return map[status] || 'info'
}

// 获取角色标签
const getRoleLabel = (role: string): string => {
  const item = projectRoleOptions.find(opt => opt.value === role)
  return item?.label || role || '-'
}

// 获取角色类型
const getRoleType = (role: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    'project_admin': 'danger',
    'editor': 'warning',
    'viewer': 'info'
  }
  return map[role] || 'info'
}

// 显示添加成员对话框
const showAddMemberDialog = () => {
  addMemberForm.email = ''
  addMemberForm.role = ''
  searchedUser.value = null
  searchedUserId.value = null
  addMemberFormRef.value?.clearValidate()
  addMemberDialogVisible.value = true
}

// 搜索用户
const searchUser = async () => {
  if (!addMemberForm.email || !addMemberForm.email.trim()) {
    ElMessage.warning('请输入用户邮箱')
    return
  }
  searchingUser.value = true
  try {
    const res = await getUserByEmail(addMemberForm.email.trim())
    if (res.data) {
      searchedUser.value = res.data
      searchedUserId.value = res.data.id
      ElMessage.success('查询成功')
    } else {
      searchedUser.value = null
      searchedUserId.value = null
      ElMessage.warning('未找到该用户')
    }
  } catch (error) {
    searchedUser.value = null
    searchedUserId.value = null
    ElMessage.error('查询用户失败')
  } finally {
    searchingUser.value = false
  }
}

// 添加成员
const handleAddMember = async () => {
  const valid = await addMemberFormRef.value?.validate()
  if (!valid) return

  if (!currentProject.value) {
    ElMessage.error('未选择项目')
    return
  }

  if (!searchedUserId.value) {
    ElMessage.warning('请先查询用户信息')
    return
  }

  addingMember.value = true
  try {
    const memberRequest: AddMemberRequest = {
      userId: searchedUserId.value,
      role: addMemberForm.role
    }
    await addProjectMember(currentProject.value.id, memberRequest)
    ElMessage.success('成员添加成功')
    addMemberDialogVisible.value = false
    // 刷新成员列表
    viewMembers(currentProject.value)
  } catch (error) {
    console.error('添加成员失败', error)
    ElMessage.error('添加成员失败')
  } finally {
    addingMember.value = false
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 查看项目详情
const viewDetail = (project: Project) => {
  currentProject.value = project
  detailDialogVisible.value = true
}

// 查看评估报告
const viewReport = async (project: Project) => {
  viewingReportProjectId.value = project.id
  try {
    const res = await getAssessmentByProjectId(project.id)
    if (res.code === 200 && res.data && res.data.id) {
      router.push({
        path: '/assessment-result',
        query: {
          assessmentId: res.data.id.toString()
        }
      })
    } else {
      ElMessage.warning('未找到该项目的评估记录')
    }
  } catch (error) {
    console.error('获取评估记录失败', error)
    ElMessage.error('获取评估记录失败')
  } finally {
    viewingReportProjectId.value = null
  }
}

// 打开上传文件抽屉
const openUploadDrawer = (project: Project) => {
  const keepCurrentUpload = currentProject.value?.id === project.id && uploadFiles.value.length > 0 && !isAssessing.value
  currentProject.value = project
  if (!keepCurrentUpload) resetUploadState()
  uploadDrawerVisible.value = true
}

// ============ 文件上传相关方法 ============

// 重置上传状态
const resetUploadState = () => {
  uploadAssessmentId.value = null
  uploadFiles.value = []
  isDragOver.value = false
  isConfirming.value = false
  isAssessing.value = false
  uploadStats.total = 0
  uploadStats.completed = 0
  uploadStats.failed = 0
}

// 触发文件选择
const triggerFileInput = () => {
  if (!isConfirming.value) {
    fileInputRef.value?.click()
  }
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const selectedFiles = Array.from(target.files || [])
  addFiles(selectedFiles)
  // 清空input，允许重复选择相同文件
  target.value = ''
}

// 处理拖放
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false

  if (!isConfirming.value && event.dataTransfer) {
    const droppedFiles = Array.from(event.dataTransfer.files)
    addFiles(droppedFiles)
  }
}

// 处理拖拽经过
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

// 处理拖拽离开
const handleDragLeave = () => {
  isDragOver.value = false
}

// 添加文件
const addFiles = (newFiles: File[]) => {
  const validFiles = newFiles.filter(file => {
    if (file.size > maxFileSize) {
      ElMessage.error(`文件 ${file.name} 超过最大大小限制 ${formatFileSize(maxFileSize)}`)
      return false
    }
    return true
  })

  const fileObjects: UploadFile[] = validFiles.map(file => ({
    id: ++fileIdCounter,
    name: file.name,
    size: file.size,
    file: file,
    progress: 0,
    status: 'waiting' as const,
    error: null,
    uploadId: null,
    assessmentId: null
  }))

  uploadFiles.value.push(...fileObjects)

  // 立即开始上传每个新添加的文件
  nextTick(async () => {
    for (const fileObj of fileObjects) {
      await uploadFileChunksHandler(fileObj)
      if (uploadFiles.value.find(f => f.id === fileObj.id)?.status === 'error') break
    }
  })
}

// 上传文件分片
const uploadFileChunksHandler = async (fileObj: UploadFile) => {
  if (fileObj.status === 'uploading' || !currentProject.value) return

  // 找到文件在数组中的索引，确保响应式更新
  const fileIndex = uploadFiles.value.findIndex(f => f.id === fileObj.id)
  if (fileIndex === -1) return

  uploadFiles.value[fileIndex].status = 'uploading'
  uploadFiles.value[fileIndex].progress = 0
  uploadFiles.value[fileIndex].error = null

  try {
    const result = await uploadFileWithChunks({
      file: fileObj.file,
      projectId: currentProject.value.id,
      chunkSize: 1024 * 1024, // 1MB
      autoConfirm: false,
      onInitialized: (upload) => {
        uploadAssessmentId.value = upload.assessmentId
        const item = uploadFiles.value.find(f => f.id === fileObj.id)
        if (item) { item.assessmentId = upload.assessmentId; item.uploadId = upload.uploadId }
      },
      onProgress: (progressInfo: UploadProgressInfo) => {
        // 通过索引访问确保响应式更新
        const idx = uploadFiles.value.findIndex(f => f.id === fileObj.id)
        if (idx !== -1) {
          uploadFiles.value[idx].progress = progressInfo.percentage
        }
      },
      onChunkSuccess: (chunkIndex: number, uploaded: number, total: number) => {
        console.log(`分片 ${chunkIndex} 上传成功 (${uploaded}/${total})`)
      },
      onChunkError: (chunkIndex: number, error: Error) => {
        console.error(`分片 ${chunkIndex} 上传失败:`, error)
      }
    })

    // 更新状态
    const idx = uploadFiles.value.findIndex(f => f.id === fileObj.id)
    if (idx !== -1) {
      uploadFiles.value[idx].status = 'success'
      uploadFiles.value[idx].progress = 100
      uploadFiles.value[idx].uploadId = result.uploadId
      uploadFiles.value[idx].assessmentId = result.assessmentId
    }

  } catch (error: any) {
    const idx = uploadFiles.value.findIndex(f => f.id === fileObj.id)
    if (idx !== -1) {
      uploadFiles.value[idx].status = 'error'
      uploadFiles.value[idx].error = error.message || '上传失败'
    }
    try {
      const latest = await getAssessmentByProjectId(currentProject.value.id, true)
      if (latest.data) uploadAssessmentId.value = latest.data.id
    } catch { /* The failure notification and result page can recover once the network returns. */ }
  }
}

// 重试上传
const retryUploadFile = async (_fileObj: UploadFile) => {
  if (hasUploadingFiles.value) return
  for (const file of uploadFiles.value) {
    file.status = 'waiting'; file.progress = 0; file.error = null
    file.uploadId = null; file.assessmentId = null
  }
  for (const file of uploadFiles.value) {
    await uploadFileChunksHandler(file)
    if (file.status === 'error') break
  }
}

// 确认所有上传
const confirmAllUploads = async () => {
  if (!currentProject.value) return

  const successFiles = uploadFiles.value.filter(f => f.status === 'success')
  const uploadingFiles = uploadFiles.value.filter(f => f.status === 'uploading')

  if (uploadingFiles.length > 0) {
    ElMessage.warning('请等待所有文件分片上传完成')
    return
  }

  if (successFiles.length === 0) {
    ElMessage.warning('没有已完成分片上传的文件')
    return
  }
  if (!uploadAssessmentId.value || uploadFiles.value.some(f => f.status !== 'success') || successFiles.some(f => f.assessmentId !== uploadAssessmentId.value)) {
    ElMessage.warning('请重新上传本批全部文件后再确认，避免遗漏失败或旧批次的文件')
    return
  }

  isConfirming.value = true
  uploadStats.total = successFiles.length
  uploadStats.completed = 0
  uploadStats.failed = uploadFiles.value.filter(f => f.status === 'error').length

  try {
    const confirmation = await confirmFileUpload(currentProject.value.id, uploadAssessmentId.value)
    isAssessing.value = true
    uploadStats.completed = successFiles.length

    // 更新项目状态
    currentProject.value.status = 'ASSESSING'
    const idx = projects.value.findIndex(p => p.id === currentProject.value?.id)
    if (idx > -1) {
      projects.value[idx] = { ...projects.value[idx], status: 'ASSESSING' }
    }

    ElMessage.success('文件已提交，正在跳转到评估结果页面...')

    // 关闭抽屉并跳转到评估结果页面（等待模式）
    uploadDrawerVisible.value = false
    router.push({
      path: '/assessment-result',
      query: {
        assessmentId: String(confirmation.data.assessmentId),
        projectId: currentProject.value.id.toString()
      }
    })
  } catch (error: any) {
    ElMessage.error(error.message || '确认上传失败')
    console.error('确认上传失败:', error)
  } finally {
    isConfirming.value = false
  }
}

// 取消上传
const cancelUpload = async (fileId: number) => {
  const file = uploadFiles.value.find(f => f.id === fileId)
  if (file && file.status === 'uploading' && currentProject.value) {
    file.status = 'waiting'
    file.progress = 0
    file.error = '上传已取消'

    if (file.uploadId && file.assessmentId) {
      try {
        await deleteUploadFile(currentProject.value.id, file.uploadId, file.assessmentId)
      } catch (error) {
        console.warn('删除临时文件失败:', error)
      }
    }
  }
}

// 移除文件
const removeFile = async (fileId: number) => {
  const index = uploadFiles.value.findIndex(f => f.id === fileId)
  if (index > -1) {
    const file = uploadFiles.value[index]
    if (file.uploadId && file.assessmentId && currentProject.value) {
      try { await deleteUploadFile(currentProject.value.id, file.uploadId, file.assessmentId) }
      catch (error) { console.warn('删除上传文件失败:', error) }
    }
    uploadFiles.value.splice(index, 1)
  }
}

// 清空所有文件
const clearAllFiles = async () => {
  if (!hasUploadingFiles.value && !isConfirming.value) {
    for (const file of [...uploadFiles.value]) await removeFile(file.id)
    uploadStats.total = 0
    uploadStats.completed = 0
    uploadStats.failed = 0
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(() => {
  fetchProjects()
  fetchEnterprises()
})
</script>

<style lang="scss" scoped>
.project-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.assessing-alert {
  margin-top: 16px;
}

.main {
  padding: 24px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h2 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }
  }

  .members-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
  }
}

// 文件上传样式
.file-upload-container {
  padding: 20px;

  .upload-area {
    border: 2px dashed #dcdfe6;
    border-radius: 8px;
    padding: 40px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: #fafafa;
    min-height: 200px;

    &:hover {
      border-color: #409eff;
      background-color: #f0f8ff;
    }

    &.drag-over {
      border-color: #409eff;
      background-color: #e6f3ff;
    }

    &.uploading {
      cursor: not-allowed;
      opacity: 0.7;
    }
  }

  .upload-placeholder {
    color: #909399;

    .upload-icon {
      font-size: 48px;
      margin-bottom: 16px;
      color: #c0c4cc;
    }

    p {
      margin: 8px 0;
    }

    .upload-hint {
      font-size: 14px;
      color: #c0c4cc;
    }
  }

  .file-list {
    text-align: left;
    max-height: 400px;
    overflow-y: auto;
  }

  .file-item {
    border: 1px solid #dcdfe6;
    border-radius: 6px;
    padding: 16px;
    margin-bottom: 12px;
    background-color: white;
    transition: all 0.3s ease;

    &.uploading {
      border-color: #409eff;
      background-color: #f0f9ff;
    }

    &.success {
      border-color: #67c23a;
      background-color: #f0f9eb;
    }

    &.error {
      border-color: #f56c6c;
      background-color: #fef0f0;
    }

    .file-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .file-name {
        font-weight: 500;
        color: #303133;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 300px;
      }

      .file-size {
        color: #909399;
        font-size: 12px;
      }
    }

    .file-progress {
      margin-bottom: 12px;
    }

    .file-actions {
      display: flex;
      gap: 8px;
    }

    .error-message {
      margin-top: 8px;
      color: #f56c6c;
      font-size: 12px;
    }
  }

  .upload-controls {
    margin-top: 20px;
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .upload-stats {
    margin-top: 20px;
    text-align: center;

    p {
      margin-bottom: 8px;
      color: #606266;
    }
  }
}
</style>
