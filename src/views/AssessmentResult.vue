<template>
  <div class="assessment-result-container">
    <AppHeader />

    <div class="page-title">
      <h1>评估结果报告</h1>
    </div>

    <el-container class="content-wrapper">
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
              <span>{{ dim }}</span>
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
        <div v-if="activeView === 'overview'" v-loading="loadingOverview">
          <OverviewReport :data="overviewData" />
        </div>

        <!-- 指标分布视图 -->
        <div v-if="activeView === 'indicator'" v-loading="loadingIndicator">
          <IndicatorReport :data="indicatorData" />
        </div>

        <!-- 风险清单视图 -->
        <div v-if="activeView === 'risk'" v-loading="loadingRisks">
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
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { DataAnalysis, TrendCharts, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import AppHeader from '@/components/AppHeader.vue'
import OverviewReport from '@/components/report/OverviewReport.vue'
import IndicatorReport from '@/components/report/IndicatorReport.vue'
import RiskReport from '@/components/report/RiskReport.vue'
import type {
  IndicatorDistributionVO,
  RiskVO,
  AssessmentDetailVO
} from '@/types/report'
import { getIndicatorDistribution, getRiskList, getAssessmentGeneral } from '@/api/report'

const route = useRoute()
const assessmentId = ref<number>(Number(route.query.assessmentId) || 118)

// 视图状态
const activeView = ref('overview')
const selectedDimension = ref('')
const selectedRiskLevel = ref('')

// 数据状态
const overviewData = ref<AssessmentDetailVO | null>(null)
const indicatorData = ref<IndicatorDistributionVO | null>(null)
const risksData = ref<RiskVO[]>([])

// 加载状态
const loadingOverview = ref(false)
const loadingIndicator = ref(false)
const loadingRisks = ref(false)

// 可用维度列表
const availableDimensions = computed(() => {
  const dimensions = new Set<string>()
  risksData.value.forEach(risk => {
    if (risk.dimension) {
      dimensions.add(risk.dimension)
    }
  })
  return Array.from(dimensions).sort()
})

// 总风险数
const totalRisks = computed(() => risksData.value.length)

// 筛选后的风险列表
const filteredRisks = computed(() => {
  let result = risksData.value

  // 按维度筛选
  if (selectedDimension.value) {
    result = result.filter(risk => risk.dimension === selectedDimension.value)
  }

  // 按风险等级筛选
  if (selectedRiskLevel.value) {
    result = result.filter(risk => risk.riskLevel === selectedRiskLevel.value)
  }

  return result
})

// 获取维度风险数量
const getDimensionRiskCount = (dimension: string): number => {
  return risksData.value.filter(risk => risk.dimension === dimension).length
}

// 获取维度徽章类型
const getDimensionBadgeType = (dimension: string): 'danger' | 'warning' | 'success' | 'info' => {
  const dimensionRisks = risksData.value.filter(risk => risk.dimension === dimension)
  if (dimensionRisks.some(r => r.riskLevel === 'HIGH_RISK')) return 'danger'
  if (dimensionRisks.some(r => r.riskLevel === 'MEDIUM_RISK')) return 'warning'
  if (dimensionRisks.some(r => r.riskLevel === 'LOW_RISK')) return 'success'
  return 'info'
}

// 菜单选择处理
const handleMenuSelect = (index: string) => {
  activeView.value = index

  // 切换视图时加载对应数据
  if (index === 'overview' && !overviewData.value) {
    loadOverviewData()
  } else if (index === 'indicator' && !indicatorData.value) {
    loadIndicatorData()
  } else if (index === 'risk' && risksData.value.length === 0) {
    loadRisksData()
  }
}

// 维度选择处理
const handleDimensionSelect = (dimension: string) => {
  selectedDimension.value = dimension
}

// 加载总览数据
const loadOverviewData = async () => {
  try {
    loadingOverview.value = true
    const response = await getAssessmentGeneral(assessmentId.value)
    if (response.code === 200) {
      overviewData.value = response.data
    } else {
      ElMessage.error(response.message || '加载总览数据失败')
    }
  } catch (error: any) {
    console.error('Failed to load overview data:', error)
    ElMessage.error(error.message || '加载总览数据失败')
  } finally {
    loadingOverview.value = false
  }
}

// 加载指标分布数据
const loadIndicatorData = async () => {
  try {
    loadingIndicator.value = true
    const response = await getIndicatorDistribution(assessmentId.value)
    if (response.code === 200) {
      indicatorData.value = response.data
    } else {
      ElMessage.error(response.message || '加载指标数据失败')
    }
  } catch (error: any) {
    console.error('Failed to load indicator data:', error)
    ElMessage.error(error.message || '加载指标数据失败')
  } finally {
    loadingIndicator.value = false
  }
}

// 加载风险数据
const loadRisksData = async () => {
  try {
    loadingRisks.value = true
    const response = await getRiskList(assessmentId.value)
    if (response.code === 200) {
      risksData.value = response.data
    } else {
      ElMessage.error(response.message || '加载风险数据失败')
    }
  } catch (error: any) {
    console.error('Failed to load risks data:', error)
    ElMessage.error(error.message || '加载风险数据失败')
  } finally {
    loadingRisks.value = false
  }
}

// 初始化
onMounted(() => {
  // 默认加载总览数据
  loadOverviewData()
})
</script>

<style scoped>
.assessment-result-container {
  min-height: 100vh;
  background-color: #f0f2f5;
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

