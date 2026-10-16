<template>
  <div class="enterprise-container">
    <el-container direction="vertical">
      <AppHeader />

      <el-main class="main">
        <div class="page-header">
          <h2>企业管理</h2>
          <el-button type="primary" @click="showCreateDialog">
            <el-icon><Plus /></el-icon>
            创建企业
          </el-button>
        </div>

        <el-form inline @submit.prevent="viewLatestReport(enterpriseName)">
          <el-form-item label="按企业名称查询评估">
            <el-input v-model="enterpriseName" placeholder="请输入完整企业名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" native-type="submit">查询最新评估</el-button>
          </el-form-item>
        </el-form>

        <!-- 企业列表 -->
        <el-table :data="enterprises" v-loading="loading" stripe style="width: 100%">
          <el-table-column prop="name" label="企业名称" min-width="200" />
          <el-table-column prop="creditCode" label="统一社会信用代码" min-width="200" />
          <el-table-column prop="type" label="企业类型" width="140" />
          <el-table-column prop="industry" label="行业" width="150" />
          <el-table-column prop="legalRepresentative" label="法定代表人" width="120" />
          <el-table-column prop="businessStatus" label="经营状态" width="100" />
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="310" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="viewMembers(row)">查看成员</el-button>
              <el-button type="primary" link @click="viewLatestReport(row.name)">最新评估</el-button>
              <el-button v-if="manageableEnterpriseIds.has(row.id)" type="primary" link :disabled="submitting || deletingId !== null" @click="showEditDialog(row)">编辑</el-button>
              <el-button v-if="manageableEnterpriseIds.has(row.id)" type="danger" link :loading="deletingId === row.id" :disabled="submitting || deletingId !== null" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 创建企业对话框 -->
        <el-dialog
          v-model="createDialogVisible"
          :title="editingEnterprise ? '编辑企业' : '创建企业'"
          width="600px"
          :close-on-click-modal="false"
          :show-close="!submitting"
          :close-on-press-escape="!submitting"
        >
          <el-form
            ref="formRef"
            :model="enterpriseForm"
            :rules="formRules"
            label-width="140px"
          >
            <el-form-item label="企业名称" prop="name">
              <el-input v-model="enterpriseForm.name" placeholder="请输入企业名称" />
            </el-form-item>
            <el-form-item label="统一社会信用代码" prop="creditCode">
              <el-input v-model="enterpriseForm.creditCode" placeholder="请输入统一社会信用代码" />
            </el-form-item>
            <el-form-item label="企业类型">
              <el-input v-model="enterpriseForm.type" placeholder="请输入企业类型" />
            </el-form-item>
            <el-form-item label="所属行业">
              <el-input v-model="enterpriseForm.industry" placeholder="请输入所属行业" />
            </el-form-item>
            <el-form-item label="经营范围">
              <el-input
                v-model="enterpriseForm.businessScope"
                type="textarea"
                :rows="3"
                placeholder="请输入经营范围"
              />
            </el-form-item>
            <el-form-item label="注册资本(万元)" prop="registeredCapital" :rules="editingEnterprise && formSnapshot?.registeredCapital != null ? [{ required: true, message: '注册资本不能清空，可填写 0', trigger: 'blur' }] : []">
              <el-input-number
                v-model="enterpriseForm.registeredCapital"
                :min="0"
                :precision="2"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="成立日期">
              <el-date-picker
                v-model="enterpriseForm.establishmentDate"
                type="date"
                placeholder="选择成立日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
                :clearable="!editingEnterprise"
              />
            </el-form-item>
            <el-form-item label="法定代表人">
              <el-input v-model="enterpriseForm.legalRepresentative" placeholder="请输入法定代表人" />
            </el-form-item>
            <el-form-item label="注册地址">
              <el-input v-model="enterpriseForm.registeredAddress" placeholder="请输入注册地址" />
            </el-form-item>
            <el-form-item label="经营状态">
              <el-input v-model="enterpriseForm.businessStatus" placeholder="请输入经营状态" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="createDialogVisible = false" :disabled="submitting">取消</el-button>
            <el-button type="primary" @click="handleCreate" :loading="submitting">{{ editingEnterprise ? '保存修改' : '创建' }}</el-button>
          </template>
        </el-dialog>

        <!-- 成员列表对话框 -->
        <el-dialog
          v-model="membersDialogVisible"
          :title="`${currentEnterprise?.name} - 成员列表`"
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
                <el-tag>{{ getRoleLabel(row.role) }}</el-tag>
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
                  v-for="item in enterpriseRoleOptions"
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
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { createEnterprise, getAllEnterprises, getEnterpriseMembers, addEnterpriseMember, getEnterprise, updateEnterprise, deleteEnterprise } from '@/api/enterprise'
import { useUserStore } from '@/stores/user'
import { getUserByEmail } from '@/api/user'
import type { Enterprise, EnterpriseCreateRequest, EnterpriseUserResponse, AddMemberRequest, UserResponse } from '@/types'
import { enterpriseRoleOptions } from '@/types'
import AppHeader from '@/components/AppHeader.vue'

const router = useRouter()
const userStore = useUserStore()
const manageableEnterpriseIds = ref(new Set<number>())
const editingEnterprise = ref<Enterprise | null>(null)
const formSnapshot = ref<EnterpriseCreateRequest | null>(null)
const deletingId = ref<number | null>(null)
const enterpriseName = ref('')
const viewLatestReport = (name: string) => {
  if (!name.trim()) {
    ElMessage.warning('请输入完整企业名称')
    return
  }
  router.push({ path: '/assessment-result', query: { enterpriseName: name.trim() } })
}

// 状态
const loading = ref(false)
const submitting = ref(false)
const membersLoading = ref(false)
const enterprises = ref<Enterprise[]>([])
const members = ref<EnterpriseUserResponse[]>([])
const createDialogVisible = ref(false)
const membersDialogVisible = ref(false)
const addMemberDialogVisible = ref(false)
const currentEnterprise = ref<Enterprise | null>(null)
const formRef = ref<FormInstance>()
const addMemberFormRef = ref<FormInstance>()
const searchedUser = ref<UserResponse | null>(null)
const searchingUser = ref(false)
const addingMember = ref(false)

// 表单数据
const enterpriseForm = reactive<EnterpriseCreateRequest>({
  name: '',
  creditCode: '',
  type: '',
  industry: '',
  businessScope: '',
  registeredCapital: undefined,
  establishmentDate: '',
  legalRepresentative: '',
  registeredAddress: '',
  businessStatus: ''
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, whitespace: true, message: '请输入企业名称', trigger: 'blur' }
  ],
  creditCode: [{ validator: (_rule, value, callback) => {
    if (editingEnterprise.value && value !== formSnapshot.value?.creditCode && !value?.trim()) callback(new Error('统一社会信用代码不能清空'))
    else callback()
  }, trigger: 'blur' }]
}

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

// 获取企业列表
const fetchEnterprises = async () => {
  loading.value = true
  try {
    const res = await getAllEnterprises()
    enterprises.value = res.data || []
    manageableEnterpriseIds.value = new Set()
    if (userStore.user) {
      const permissions = await Promise.allSettled(enterprises.value.map(async enterprise => {
        const response = await getEnterpriseMembers(enterprise.id, true)
        return response.data.some(member => member.user?.id === userStore.user?.id && member.role.toLowerCase() === 'admin') ? enterprise.id : null
      }))
      manageableEnterpriseIds.value = new Set(permissions.flatMap(result => result.status === 'fulfilled' && result.value !== null ? [result.value] : []))
    }
  } catch (error) {
    console.error('获取企业列表失败', error)
  } finally {
    loading.value = false
  }
}

// 显示创建对话框
const showCreateDialog = () => {
  if (submitting.value) return
  editingEnterprise.value = null
  formSnapshot.value = null
  resetForm()
  createDialogVisible.value = true
}

const showEditDialog = async (enterprise: Enterprise) => {
  if (submitting.value) return
  submitting.value = true
  try {
    const response = await getEnterprise(enterprise.id)
    resetForm()
    const data = response.data
    for (const key of Object.keys(enterpriseForm) as (keyof EnterpriseCreateRequest)[]) {
      if (key !== 'registeredCapital') Object.assign(enterpriseForm, { [key]: data[key] ?? '' })
    }
    enterpriseForm.registeredCapital = data.registeredCapital ?? undefined
    editingEnterprise.value = data
    formSnapshot.value = { ...enterpriseForm }
    createDialogVisible.value = true
  } catch (error) { console.error('读取企业详情失败', error) }
  finally { submitting.value = false }
}

const handleDelete = async (enterprise: Enterprise) => {
  if (deletingId.value !== null) return
  deletingId.value = enterprise.id
  try {
    await ElMessageBox.confirm(`确定删除企业“${enterprise.name}”吗？该企业的所有项目、成员关系及关联评估数据也会删除，关联文件将在后台清理。此操作无法撤销。`, '删除企业', {
      type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消', confirmButtonClass: 'el-button--danger'
    })
  } catch { deletingId.value = null; return }
  try {
    await deleteEnterprise(enterprise.id)
    enterprises.value = enterprises.value.filter(item => item.id !== enterprise.id)
    if (currentEnterprise.value?.id === enterprise.id) {
      currentEnterprise.value = null; members.value = []; membersDialogVisible.value = false; addMemberDialogVisible.value = false
    }
    ElMessage.success('企业已删除，关联文件将在后台清理')
    await fetchEnterprises()
  } catch (error) { console.error('删除企业失败', error) }
  finally { deletingId.value = null }
}

// 重置表单
const resetForm = () => {
  Object.assign(enterpriseForm, {
    name: '',
    creditCode: '',
    type: '',
    industry: '',
    businessScope: '',
    registeredCapital: undefined,
    establishmentDate: '',
    legalRepresentative: '',
    registeredAddress: '',
    businessStatus: ''
  })
  formRef.value?.clearValidate()
}

// 创建企业
const handleCreate = async () => {
  if (submitting.value) return
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (editingEnterprise.value) {
      const changes = Object.fromEntries(Object.entries(enterpriseForm).filter(([key, value]) =>
        value != null && value !== formSnapshot.value?.[key as keyof EnterpriseCreateRequest]))
      if (Object.keys(changes).length === 0) { ElMessage.info('没有需要保存的修改'); return }
      const response = await updateEnterprise(editingEnterprise.value.id, changes)
      enterprises.value = enterprises.value.map(item => item.id === response.data.id ? response.data : item)
      if (currentEnterprise.value?.id === response.data.id) currentEnterprise.value = response.data
      ElMessage.success('企业修改成功')
    } else {
      await createEnterprise(enterpriseForm)
      ElMessage.success('企业创建成功')
    }
    createDialogVisible.value = false
    await fetchEnterprises()
  } catch (error) {
    console.error('创建企业失败', error)
  } finally {
    submitting.value = false
  }
}

// 查看成员
const viewMembers = async (enterprise: Enterprise) => {
  currentEnterprise.value = enterprise
  membersDialogVisible.value = true
  membersLoading.value = true
  try {
    const res = await getEnterpriseMembers(enterprise.id)
    members.value = res.data || []
  } catch (error) {
    console.error('获取成员列表失败', error)
  } finally {
    membersLoading.value = false
  }
}

// 获取角色标签
const getRoleLabel = (role: string) => {
  const item = enterpriseRoleOptions.find(opt => opt.value === role)
  return item?.label || role
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

  if (!currentEnterprise.value) {
    ElMessage.error('未选择企业')
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
    await addEnterpriseMember(currentEnterprise.value.id, memberRequest)
    ElMessage.success('成员添加成功')
    addMemberDialogVisible.value = false
    // 刷新成员列表
    viewMembers(currentEnterprise.value)
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


onMounted(() => {
  fetchEnterprises()
})
</script>

<style lang="scss" scoped>
.enterprise-container {
  min-height: 100vh;
  background: #f5f7fa;
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

