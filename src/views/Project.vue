<template>
  <div class="project-container">
    <el-container>
      <el-header class="header">
        <div class="logo">
          <h1>风险合规预警系统</h1>
        </div>
        <div class="nav-menu">
          <el-menu mode="horizontal" :default-active="activeMenu" router>
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/enterprise">企业管理</el-menu-item>
            <el-menu-item index="/project">项目管理</el-menu-item>
          </el-menu>
        </div>
        <div class="user-info">
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              <el-avatar :size="32" :src="userStore.user?.avatarUrl || undefined">
                {{ userStore.user?.fullName?.charAt(0) }}
              </el-avatar>
              <span class="user-name">{{ userStore.user?.fullName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

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
          <el-table-column prop="type" label="项目类型" width="120">
            <template #default="{ row }">
              {{ getProjectTypeLabel(row.type) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="industry" label="行业" width="150">
            <template #default="{ row }">
              {{ getIndustryLabel(row.industry) }}
            </template>
          </el-table-column>
          <el-table-column prop="region" label="区域" width="100">
            <template #default="{ row }">
              {{ getRegionLabel(row.region) }}
            </template>
          </el-table-column>
          <el-table-column prop="orientedUser" label="面向用户" width="140">
            <template #default="{ row }">
              {{ getOrientedUserLabel(row.orientedUser) }}
            </template>
          </el-table-column>
          <el-table-column prop="startDate" label="开始日期" width="120" />
          <el-table-column prop="plannedCompletionDate" label="计划完成日期" width="130" />
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="viewMembers(row)">查看成员</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 创建项目对话框 -->
        <el-dialog
          v-model="createDialogVisible"
          title="创建项目"
          width="650px"
          :close-on-click-modal="false"
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
            <el-form-item label="项目类型" prop="type">
              <el-select v-model="projectForm.type" placeholder="请选择项目类型" style="width: 100%">
                <el-option
                  v-for="item in projectTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
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
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="计划完成日期">
                  <el-date-picker
                    v-model="projectForm.plannedCompletionDate"
                    type="date"
                    placeholder="选择计划完成日期"
                    style="width: 100%"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <template #footer>
            <el-button @click="createDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleCreate" :loading="submitting">创建</el-button>
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
            <el-form-item label="用户ID" prop="userId">
              <el-input-number
                v-model="addMemberForm.userId"
                :min="1"
                placeholder="请输入用户ID"
                style="width: 100%"
                controls-position="right"
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
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ArrowDown, Plus } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { createProject, getAllProjects, getProjectMembers, addProjectMember } from '@/api/project'
import { getAllEnterprises } from '@/api/enterprise'
import { getUserById } from '@/api/user'
import type { Project, ProjectCreateRequest, ProjectMemberResponse, Enterprise, AddMemberRequest, UserResponse } from '@/types'
import {
  projectTypeOptions,
  industryOptions,
  regionOptions,
  orientedUserOptions,
  projectRoleOptions
} from '@/types'

const userStore = useUserStore()
const activeMenu = '/project'

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

// 表单数据
const projectForm = reactive<ProjectCreateRequest>({
  enterpriseId: 0,
  name: '',
  type: '',
  description: '',
  startDate: '',
  plannedCompletionDate: '',
  industry: '',
  region: '',
  orientedUser: ''
})

// 表单验证规则
const formRules: FormRules = {
  enterpriseId: [
    { required: true, message: '请选择所属企业', trigger: 'change' }
  ],
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择项目类型', trigger: 'change' }
  ],
  industry: [
    { required: true, message: '请选择所属行业', trigger: 'change' }
  ],
  region: [
    { required: true, message: '请选择所属区域', trigger: 'change' }
  ],
  orientedUser: [
    { required: true, message: '请选择面向用户', trigger: 'change' }
  ]
}

// 添加成员表单
const addMemberForm = reactive<AddMemberRequest>({
  userId: 0,
  role: ''
})

// 添加成员表单验证规则
const addMemberFormRules: FormRules = {
  userId: [
    { required: true, message: '请输入用户ID', trigger: 'blur' }
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
  resetForm()
  createDialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  Object.assign(projectForm, {
    enterpriseId: 0,
    name: '',
    type: '',
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
  const valid = await formRef.value?.validate()
  if (!valid) return

  submitting.value = true
  try {
    await createProject(projectForm)
    ElMessage.success('项目创建成功')
    createDialogVisible.value = false
    fetchProjects()
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

// 获取项目类型标签
const getProjectTypeLabel = (type: string) => {
  const item = projectTypeOptions.find(opt => opt.value === type)
  return item?.label || type
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
    'PENDING': '待开始'
  }
  return map[status] || status
}

// 获取状态类型
const getStatusType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    'IN_PROGRESS': 'primary',
    'COMPLETED': 'success',
    'CANCELLED': 'info',
    'PENDING': 'warning'
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
  addMemberForm.userId = 0
  addMemberForm.role = ''
  searchedUser.value = null
  addMemberFormRef.value?.clearValidate()
  addMemberDialogVisible.value = true
}

// 搜索用户
const searchUser = async () => {
  if (!addMemberForm.userId || addMemberForm.userId <= 0) {
    ElMessage.warning('请输入有效的用户ID')
    return
  }
  searchingUser.value = true
  try {
    const res = await getUserById(addMemberForm.userId)
    if (res.data) {
      searchedUser.value = res.data
      ElMessage.success('查询成功')
    } else {
      searchedUser.value = null
      ElMessage.warning('未找到该用户')
    }
  } catch (error) {
    searchedUser.value = null
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

  addingMember.value = true
  try {
    await addProjectMember(currentProject.value.id, addMemberForm)
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

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
  }
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

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 0 24px;

  .logo h1 {
    font-size: 20px;
    color: #333;
    margin: 0;
  }

  .nav-menu {
    flex: 1;
    margin-left: 40px;

    :deep(.el-menu) {
      border-bottom: none;
    }
  }

  .user-dropdown {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    .user-name {
      color: #333;
    }
  }
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
</style>

