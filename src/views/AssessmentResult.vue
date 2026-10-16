<template>
  <div class="assessment-result-container">
    <AppHeader />

    <div class="page-title">
      <h1>{{ enterpriseName ? `${enterpriseName} · 最新评估报告` : '评估结果报告' }}</h1>
      <el-button :loading="loadingOverview" @click="refresh">刷新状态</el-button>
    </div>

    <div v-if="queryError" class="status-panel">
      <el-alert title="暂时无法查询评估结果" :description="queryError" type="warning" show-icon :closable="false" />
    </div>
    <div v-if="isFailed" class="status-panel">
      <el-result icon="error" title="评估失败" :sub-title="failure?.failureReason || '未记录具体原因，请联系管理员并提供评估 ID'">
        <template #extra>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="评估 ID">{{ assessmentId }}</el-descriptions-item>
            <el-descriptions-item label="项目 ID">{{ overviewData?.projectId }}</el-descriptions-item>
            <el-descriptions-item label="失败阶段">{{ failureStageLabel }}</el-descriptions-item>
            <el-descriptions-item label="失败编码">{{ failure?.failureCode || '未记录' }}</el-descriptions-item>
            <el-descriptions-item label="失败时间" :span="2">{{ formatDate(failure?.failedAt) }}</el-descriptions-item>
          </el-descriptions>
          <p>可凭评估 ID 和失败时间查询后台处理记录。重新评估需在项目页面重新上传材料。</p>
          <el-button type="primary" @click="router.push(enterpriseName ? '/enterprise' : '/project')">{{ enterpriseName ? '返回企业列表' : '返回项目列表' }}</el-button>
        </template>
      </el-result>
    </div>
    <div v-else-if="isWaiting" class="status-panel waiting-panel">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <h2>{{ currentStatus === AssessmentStatusEnum.UPLOADING ? '材料上传中' : currentStatus === AssessmentStatusEnum.TO_BE_ASSESSED ? '评估任务已提交' : '正在评估中...' }}</h2>
      <p>系统正在处理材料，完成或失败后会自动更新结果。</p>
      <p v-if="assessmentId">评估 ID：{{ assessmentId }}</p>
    </div>
    <el-empty v-else-if="!loadingOverview && !isComplete && !queryError" :description="noRecords ? '该企业暂无评估记录' : '请选择需要查询的企业或项目'" />
    <div v-else-if="loadingOverview && !isComplete" class="status-panel" v-loading="true" style="min-height: 150px" />

    <el-container v-if="isComplete && overviewData" class="content-wrapper">
      <!-- 左侧导航栏 -->
      <el-aside width="260px" class="sidebar">
        <el-menu
          :default-active="activeView"
          class="sidebar-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="overview">
            <el-icon><DataAnalysis /></el-icon>
            <span>总览报告</span>
          </el-menu-item>
          <el-menu-item index="indicator">
            <el-icon><TrendCharts /></el-icon>
            <span>指标分布</span>
          </el-menu-item>
          <el-menu-item index="risk">
            <el-icon><Document /></el-icon>
            <span>风险清单</span>
          </el-menu-item>
        </el-menu>

        <!-- 维度筛选（仅在风险清单视图显示） -->
        <div v-if="activeView === 'risk'" class="dimension-filter">
          <div class="filter-header">
            <h4>风险维度</h4>
          </div>
          <el-menu
            :default-active="selectedDimension"
            class="dimension-menu"
            @select="handleDimensionSelect"
          >
            <el-menu-item index="">
              <span>全部维度</span>
              <el-badge
                v-if="totalRisks > 0"
                :value="totalRisks"
                class="dimension-badge"
              />
            </el-menu-item>
            <el-menu-item
              v-for="dim in availableDimensions"
              :key="dim"
              :index="dim"
            >
              <span>{{ getDimensionLabel(dim) }}</span>
              <el-badge
                v-if="getDimensionRiskCount(dim) > 0"
                :value="getDimensionRiskCount(dim)"
                class="dimension-badge"
                :type="getDimensionBadgeType(dim)"
              />
            </el-menu-item>
          </el-menu>
        </div>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <!-- 总览视图 -->
        <div v-show="activeView === 'overview'" v-loading="loadingOverview">
          <OverviewReport :data="overviewData" />
        </div>

        <!-- 指标分布视图 -->
        <div v-show="activeView === 'indicator'" v-loading="loadingIndicator">
          <IndicatorReport :data="indicatorData" />
        </div>

        <!-- 风险清单视图 -->
        <div v-show="activeView === 'risk'" v-loading="loadingRisks">
          <RiskReport
            :risks="filteredRisks"
            :selected-dimension="selectedDimension"
            :selected-risk-level="selectedRiskLevel"
            @update:risk-level="selectedRiskLevel = $event"
          />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DataAnalysis, TrendCharts, Document, Loading } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import OverviewReport from '@/components/report/OverviewReport.vue'
import IndicatorReport from '@/components/report/IndicatorReport.vue'
import RiskReport from '@/components/report/RiskReport.vue'
import { AssessmentStatusEnum, assessmentFailureStageLabels } from '@/types/report'
import type { IndicatorDistributionVO, RiskVO, AssessmentDetailVO, AssessmentStatusResponse } from '@/types/report'
import { getIndicatorDistribution, getRiskList, getAssessmentGeneral, getAssessmentStatus } from '@/api/report'
import { getAssessmentByProjectId } from '@/api/project'
import { getLatestEnterpriseAssessment } from '@/api/enterprise'
import websocketService from '@/utils/websocket'
import type { NotificationMessage } from '@/utils/websocket'
import { filterRisks, normalizeDimension, getDimensionLabel, getDimensionBadgeType as getDimensionBadgeTypeUtil } from '@/utils/riskClassification'

const route = useRoute()
const router = useRouter()
const positiveId = (value: unknown) => {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : 0
}
const enterpriseName = computed(() => typeof route.query.enterpriseName === 'string' ? route.query.enterpriseName : '')
const waitingProjectId = computed(() => positiveId(route.query.projectId))
const afterAssessmentId = computed(() => positiveId(route.query.afterAssessmentId))
const assessmentId = ref(0)
const isWaiting = ref(false)
const noRecords = ref(false)
const queryError = ref('')
const overviewData = ref<AssessmentDetailVO | null>(null)
const statusData = ref<AssessmentStatusResponse | null>(null)
const currentStatus = computed(() => statusData.value?.status ?? overviewData.value?.overallResult.status)
const isComplete = computed(() => currentStatus.value === AssessmentStatusEnum.ASSESSED)
const isFailed = computed(() => currentStatus.value === AssessmentStatusEnum.FAILED)
const failure = computed(() => statusData.value ?? overviewData.value?.overallResult)
const failureStageLabel = computed(() => assessmentFailureStageLabels[failure.value?.failureStage || ''] || failure.value?.failureStage || '未记录')
const activeView = ref('overview')
const selectedDimension = ref('')
const selectedRiskLevel = ref('')
const indicatorData = ref<IndicatorDistributionVO | null>(null)
const risksData = ref<RiskVO[]>([])
const loadingOverview = ref(false)
const loadingIndicator = ref(false)
const loadingRisks = ref(false)
const availableDimensions = computed(() => Array.from(new Set(risksData.value.map(risk => normalizeDimension(risk.dimension)).filter(Boolean))).sort())
const totalRisks = computed(() => risksData.value.length)
const filteredRisks = computed(() => filterRisks(risksData.value, selectedDimension.value, selectedRiskLevel.value))
const getDimensionRiskCount = (dimension: string) => risksData.value.filter(risk => normalizeDimension(risk.dimension) === normalizeDimension(dimension)).length
const getDimensionBadgeType = (dimension: string) => getDimensionBadgeTypeUtil(risksData.value, dimension)
const formatDate = (value?: string | null) => value ? new Date(value).toLocaleString('zh-CN') : '未记录'
let revision = 0
let disposed = false
let busy = false
let pollTimer: ReturnType<typeof setTimeout> | undefined
const stopPolling = () => { clearTimeout(pollTimer); pollTimer = undefined }

const failedReport = (status: AssessmentStatusResponse): AssessmentDetailVO => ({
  assessmentId: status.assessmentId, projectId: status.projectId, assessmentDate: null,
  overallResult: { ...status, overallScore: null, overallRiskLevel: null },
  riskSummary: null, indicatorOverview: null, dimensionRiskDistribution: null
})

const acceptReport = (report: AssessmentDetailVO) => {
  if (!report || !positiveId(report.assessmentId) || !Object.values(AssessmentStatusEnum).includes(report.overallResult?.status)) {
    throw new Error('评估结果格式异常，请稍后重试')
  }
  if (assessmentId.value !== report.assessmentId) {
    indicatorData.value = null
    risksData.value = []
    activeView.value = 'overview'
    selectedDimension.value = ''
    selectedRiskLevel.value = ''
  }
  assessmentId.value = report.assessmentId
  overviewData.value = report
  statusData.value = null
  isWaiting.value = ![AssessmentStatusEnum.ASSESSED, AssessmentStatusEnum.FAILED].includes(report.overallResult.status)
}

// Query failures remain separate from a persisted FAILED assessment. Poll requests never overlap.
const refresh = async () => {
  if (busy || disposed) return
  const version = revision
  busy = true
  stopPolling()
  loadingOverview.value = true
  queryError.value = ''
  try {
    if (enterpriseName.value) {
      const response = await getLatestEnterpriseAssessment(enterpriseName.value, true)
      if (version !== revision || disposed) return
      noRecords.value = response.data === null
      if (!response.data) {
        overviewData.value = null
        statusData.value = null
        assessmentId.value = 0
        isWaiting.value = false
        return
      }
      acceptReport(response.data)
    } else {
      if (!assessmentId.value && waitingProjectId.value) {
        const latest = await getAssessmentByProjectId(waitingProjectId.value, true)
        if (version !== revision || disposed) return
        if (!latest.data || latest.data.id <= afterAssessmentId.value) {
          isWaiting.value = true
          return
        }
        assessmentId.value = latest.data.id
      }
      if (!assessmentId.value) return
      const response = await getAssessmentStatus(assessmentId.value, true)
      if (version !== revision || disposed) return
      if (!response.data || !Object.values(AssessmentStatusEnum).includes(response.data.status)) {
        throw new Error('评估状态格式异常，请稍后重试')
      }
      statusData.value = response.data
      isWaiting.value = ![AssessmentStatusEnum.ASSESSED, AssessmentStatusEnum.FAILED].includes(response.data.status)
      if (response.data.status === AssessmentStatusEnum.FAILED) {
        overviewData.value = failedReport(response.data)
      } else if (response.data.status === AssessmentStatusEnum.ASSESSED) {
        const report = await getAssessmentGeneral(assessmentId.value, true)
        if (version !== revision || disposed) return
        acceptReport(report.data)
      }
    }
  } catch (error) {
    if (version === revision && !disposed) {
      const message = error instanceof Error ? error.message : ''
      queryError.value = !message || /network|timeout/i.test(message) ? '暂时无法查询评估结果，请检查网络或稍后重试' : message
    }
  } finally {
    if (version === revision && !disposed) {
      busy = false
      loadingOverview.value = false
      if (isWaiting.value || (queryError.value && !isComplete.value && !isFailed.value && (assessmentId.value || enterpriseName.value || waitingProjectId.value))) {
        pollTimer = setTimeout(refresh, 5000)
      }
    }
  }
}

const loadIndicatorData = async () => {
  if (!isComplete.value || loadingIndicator.value) return
  const version = revision
  loadingIndicator.value = true
  try {
    const response = await getIndicatorDistribution(assessmentId.value)
    if (version === revision && !disposed && isComplete.value) indicatorData.value = response.data
  } catch { /* The request interceptor displays detail-request errors. */ }
  finally { if (version === revision && !disposed) loadingIndicator.value = false }
}
const loadRisksData = async () => {
  if (!isComplete.value || loadingRisks.value) return
  const version = revision
  loadingRisks.value = true
  try {
    const response = await getRiskList(assessmentId.value)
    if (version === revision && !disposed && isComplete.value) risksData.value = response.data ?? []
  } catch { /* The request interceptor displays detail-request errors. */ }
  finally { if (version === revision && !disposed) loadingRisks.value = false }
}
const handleMenuSelect = (index: string) => {
  activeView.value = index
  if (index === 'indicator' && !indicatorData.value) void loadIndicatorData()
  if (index === 'risk' && !risksData.value.length) void loadRisksData()
}
const handleDimensionSelect = (dimension: string) => { selectedDimension.value = dimension }

const handleNotificationMessage = (message: NotificationMessage) => {
  const terminal = ['ASSESSMENT_FAILED', 'ASSESSMENT_COMPLETED', 'ASSESSMENT_COMPLETE', 'PROCESSING_COMPLETE']
  if (!terminal.includes(message.notificationType) || !message.assessmentId) return
  // Once an ID is known, project equality alone must not accept an older or different assessment.
  const matches = assessmentId.value ? message.assessmentId === assessmentId.value
    : waitingProjectId.value && message.projectId === waitingProjectId.value && message.assessmentId > afterAssessmentId.value
  if (!matches) return
  revision++
  busy = false
  stopPolling()
  assessmentId.value = message.assessmentId
  if (message.notificationType === 'ASSESSMENT_FAILED') {
    const extra = typeof message.extraData === 'object' ? message.extraData : undefined
    statusData.value = {
      assessmentId: message.assessmentId, projectId: message.projectId || overviewData.value?.projectId || waitingProjectId.value,
      status: AssessmentStatusEnum.FAILED, failureCode: extra?.failureCode ?? null,
      failureReason: extra?.failureReason || message.content || '评估失败，请重新提交材料',
      failureStage: extra?.failureStage ?? null, failedAt: extra?.failedAt ?? null
    }
    overviewData.value = failedReport(statusData.value)
    isWaiting.value = false
  }
  void refresh()
}
const reconnect = () => { if (isWaiting.value || !currentStatus.value) void refresh() }

watch(() => route.fullPath, () => {
  revision++
  stopPolling()
  busy = false
  assessmentId.value = positiveId(route.query.assessmentId)
  overviewData.value = null
  statusData.value = null
  indicatorData.value = null
  risksData.value = []
  loadingIndicator.value = false
  loadingRisks.value = false
  noRecords.value = false
  activeView.value = 'overview'
  selectedDimension.value = ''
  selectedRiskLevel.value = ''
  isWaiting.value = route.query.waiting === 'true'
  void refresh()
}, { immediate: true })

onMounted(() => {
  websocketService.on('notification', handleNotificationMessage)
  websocketService.on('bind_success', reconnect)
  window.addEventListener('online', reconnect)
})
onUnmounted(() => {
  disposed = true
  revision++
  stopPolling()
  websocketService.off('notification', handleNotificationMessage)
  websocketService.off('bind_success', reconnect)
  window.removeEventListener('online', reconnect)
})
</script>

<style scoped>
.status-panel { max-width: 1200px; margin: 20px auto; padding: 24px; background: #fff; border-radius: 8px; }
.page-title { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.waiting-panel { text-align: center; padding: 64px 24px; }
.waiting-panel .loading-icon { font-size: 48px; color: #409eff; animation: rotate 1.5s linear infinite; }
.status-panel :deep(.el-result__extra) { width: min(100%, 800px); }
.assessment-result-container {
  min-height: 100vh;
  background-color: #f0f2f5;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.page-title {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px 20px 0;
}

.page-title h1 {
  margin: 0;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  font-size: 22px;
  font-weight: 600;
  color: #1f2f3d;
}

.content-wrapper {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
  gap: 20px;
}

/* 侧边栏样式 */
.sidebar {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.sidebar-menu {
  border-right: none;
}

.sidebar-menu .el-menu-item {
  height: 56px;
  line-height: 56px;
  font-size: 14px;
  border-left: 3px solid transparent;
  transition: all 0.3s;
}

.sidebar-menu .el-menu-item:hover {
  background-color: #ecf5ff;
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #ecf5ff;
  border-left-color: #409eff;
  color: #409eff;
}

.sidebar-menu .el-menu-item .el-icon {
  margin-right: 8px;
  font-size: 18px;
}

/* 维度筛选 */
.dimension-filter {
  margin-top: 20px;
  border-top: 1px solid #ebeef5;
}

.filter-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
}

.filter-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.dimension-menu {
  border-right: none;
}

.dimension-menu .el-menu-item {
  height: 48px;
  line-height: 48px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 15px;
}

.dimension-badge {
  margin-left: auto;
}

:deep(.dimension-badge .el-badge__content) {
  font-size: 11px;
  padding: 0 6px;
  height: 18px;
  line-height: 18px;
}

/* 主内容区 */
.main-content {
  background: transparent;
  padding: 0;
}
</style>
