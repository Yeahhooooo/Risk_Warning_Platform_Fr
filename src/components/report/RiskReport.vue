<template>
  <div class="risk-report">
    <el-card class="report-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h3>
            {{ selectedDimension ? getDimensionLabel(selectedDimension) : '全部维度' }} - 风险清单
          </h3>
          <div class="header-actions">
            <el-select
              :model-value="selectedRiskLevel"
              @update:model-value="$emit('update:riskLevel', $event)"
              placeholder="风险等级筛选"
              style="width: 150px; margin-right: 10px;"
              clearable
            >
              <el-option label="全部等级" value="" />
              <el-option label="高风险" value="HIGH_RISK" />
              <el-option label="中风险" value="MEDIUM_RISK" />
              <el-option label="低风险" value="LOW_RISK" />
            </el-select>
            <el-button type="primary" @click="handleExport">导出报告</el-button>
          </div>
        </div>
      </template>

      <!-- 风险统计卡片 -->
      <div class="risk-stats">
        <div class="stat-card total">
          <div class="stat-label">风险总数</div>
          <div class="stat-value">{{ risks.length }}</div>
        </div>
        <div class="stat-card high">
          <div class="stat-label">高风险</div>
          <div class="stat-value">{{ highRiskCount }}</div>
        </div>
        <div class="stat-card medium">
          <div class="stat-label">中风险</div>
          <div class="stat-value">{{ mediumRiskCount }}</div>
        </div>
        <div class="stat-card low">
          <div class="stat-label">低风险</div>
          <div class="stat-value">{{ lowRiskCount }}</div>
        </div>
      </div>

      <!-- 风险列表 -->
      <div class="risk-list" v-if="risks.length > 0">
        <div class="risk-table-header">
          <span>风险等级</span>
          <span>风险点及触发依据</span>
          <span>风险类别</span>
          <span>处理状态</span>
        </div>
        <el-collapse accordion>
          <el-collapse-item
            v-for="(risk, index) in risks"
            :key="risk.id"
            :name="index"
          >
            <template #title>
              <div class="risk-title">
                <el-tag
                  :type="getRiskLevelType(risk.riskLevel)"
                  effect="dark"
                  class="risk-tag"
                >
                  {{ getRiskLevelLabel(risk.riskLevel) }}
                </el-tag>
                <span class="risk-name">{{ risk.name || '-' }}</span>
                <span class="risk-dimension">{{ getDimensionLabel(risk.dimension) }}</span>
                <span class="risk-status">
                  <el-tag size="small" :type="getProcessingStatusType(risk.processingStatus)">
                    {{ risk.processingStatus || '-' }}
                  </el-tag>
                </span>
              </div>
            </template>

            <div class="risk-detail">
              <!-- 基本信息 -->
              <el-descriptions :column="2" border>
                <el-descriptions-item label="风险描述" :span="2">
                  {{ risk.description || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="风险维度">
                  {{ getDimensionLabel(risk.dimension) }}
                </el-descriptions-item>
                <el-descriptions-item label="风险等级">
                  <el-tag :type="getRiskLevelType(risk.riskLevel)" effect="dark">
                    {{ getRiskLevelLabel(risk.riskLevel) }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>

              <!-- 相关企业行为 -->
              <div class="related-section" v-if="collectBehaviors(risk.relatedIndicators).length > 0">
                <h4>相关企业行为</h4>
                <ul class="behavior-list">
                  <li
                    v-for="(desc, i) in collectBehaviors(risk.relatedIndicators)"
                    :key="i"
                    class="behavior-item"
                  >
                    {{ desc }}
                  </li>
                </ul>
              </div>

              <!-- 相关指标 -->
              <div class="related-section" v-if="dedupeIndicators(risk.relatedIndicators).length > 0">
                <h4>相关指标</h4>
                <el-table :data="dedupeIndicators(risk.relatedIndicators)" border size="small">
                  <el-table-column label="指标名称 / 所属层级" min-width="320">
                    <template #default="{ row }">
                      <div class="indicator-cell">
                        <span class="indicator-label">{{ row.indicatorName || '-' }}</span>
                        <span
                          v-if="pathSegments(risk, row).length > 0"
                          class="indicator-path"
                        >
                          <template
                            v-for="(seg, i) in pathSegments(risk, row)"
                            :key="i"
                          >
                            <span
                              class="path-seg"
                              :class="{ 'is-leaf': i === pathSegments(risk, row).length - 1 }"
                            >{{ seg }}</span>
                            <span
                              v-if="i < pathSegments(risk, row).length - 1"
                              class="path-sep"
                            >&gt;</span>
                          </template>
                        </span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="得分" width="100" align="center">
                    <template #default="{ row }">
                      <span :class="getScoreClass(row.score, row.maxScore, row.threshold)">
                        {{ formatScore(row.score) }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column label="满分" width="90" align="center">
                    <template #default="{ row }">
                      {{ row.maxScore != null ? formatScore(row.maxScore) : (row.threshold != null ? formatScore(row.threshold) : '-') }}
                    </template>
                  </el-table-column>
                  <el-table-column label="主要触发" width="100" align="center">
                    <template #default="{ row }">
                      <el-tag v-if="isPrimaryTrigger(row)" type="danger" size="small">是</el-tag>
                      <el-tag v-else type="info" size="small">否</el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 相关法规 -->
              <div class="related-section" v-if="collectRegulations(risk).length > 0">
                <h4>相关法规</h4>
                <el-table :data="collectRegulations(risk)" border size="small">
                  <el-table-column prop="regulationName" label="法规名称" min-width="200" />
                  <el-table-column prop="violationType" label="违规类型" width="120" />
                  <el-table-column prop="complianceRequirement" label="合规要求" min-width="250" />
                </el-table>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-else
        description="暂无风险数据"
        :image-size="120"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { RelatedIndicator, RelatedRegulation, RiskVO } from '@/types/report'

import {
  normalizeRiskLevel,
  getDimensionLabel,
  getRiskLevelLabel as getRiskLevelLabelUtil,
  getRiskLevelTagType as getRiskLevelTagTypeUtil
} from '@/utils/riskClassification'

interface Props {
  risks: RiskVO[]
  selectedDimension?: string
  selectedRiskLevel?: string
  /**
   * 指标完整层级路径映射：indicatorId -> "产品法律风险 > 产品设计开发合规 > 产品标识与警示 > 产品标识管理制度"
   * 来源为「指标分布」接口的 indicatorScores[].relatedIndicator
   */
  indicatorPaths?: Record<string, string>
}

const props = defineProps<Props>()
defineEmits<{
  'update:riskLevel': [value: string]
}>()

// 风险统计
const highRiskCount = computed(() =>
  props.risks.filter(r => normalizeRiskLevel(r.riskLevel) === 'HIGH_RISK').length
)

const mediumRiskCount = computed(() =>
  props.risks.filter(r => normalizeRiskLevel(r.riskLevel) === 'MEDIUM_RISK').length
)

const lowRiskCount = computed(() =>
  props.risks.filter(r => normalizeRiskLevel(r.riskLevel) === 'LOW_RISK').length
)

// 风险等级标签类型
const getRiskLevelType = (level: unknown) => {
  return getRiskLevelTagTypeUtil(level)
}

// 风险等级标签文本
const getRiskLevelLabel = (level: unknown) => {
  return getRiskLevelLabelUtil(level)
}

// 处理状态标签类型
const getProcessingStatusType = (status?: string) => {
  const typeMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    '成功': 'success',
    '处理中': 'warning',
    '失败': 'danger'
  }
  return status ? (typeMap[status] || 'info') : 'info'
}

// 相关指标去重：同名指标只保留得分最高的一条
const dedupeIndicators = (indicators?: RelatedIndicator[]): RelatedIndicator[] => {
  if (!indicators || indicators.length === 0) return []

  const map = new Map<string, RelatedIndicator>()
  for (const item of indicators) {
    const key = item.indicatorId || item.indicatorName
    const existing = map.get(key)
    if (!existing || (item.score ?? 0) > (existing.score ?? 0)) {
      map.set(key, item)
    }
  }
  return Array.from(map.values())
}

// 收集触发该风险的企业行为描述：跨相关指标聚合、去重并去空
const collectBehaviors = (indicators?: RelatedIndicator[]): string[] => {
  if (!indicators || indicators.length === 0) return []

  const seen = new Set<string>()
  const result: string[] = []
  for (const indicator of indicators) {
    for (const behavior of indicator.relatedBehaviors ?? []) {
      const desc = behavior.description?.trim()
      if (desc && !seen.has(desc)) {
        seen.add(desc)
        result.push(desc)
      }
    }
  }
  return result
}

// 收集相关法规：顶层 relatedRegulations 可能为 null，
// 后端实际把法规挂在 relatedIndicators[].relatedBehaviors[].relatedRegulations 里
const collectRegulations = (risk: RiskVO): RelatedRegulation[] => {
  const seen = new Set<string>()
  const result: RelatedRegulation[] = []

  const push = (reg?: RelatedRegulation | null) => {
    if (!reg) return
    const key = reg.regulationId || `${reg.regulationName}|${reg.violationType}`
    if (seen.has(key)) return
    seen.add(key)
    result.push(reg)
  }

  for (const reg of risk.relatedRegulations ?? []) push(reg)

  for (const indicator of risk.relatedIndicators ?? []) {
    for (const behavior of indicator.relatedBehaviors ?? []) {
      for (const reg of behavior.relatedRegulations ?? []) push(reg)
    }
  }

  return result
}

// 解析单个指标的完整层级路径
const resolveIndicatorPath = (risk: RiskVO, indicator: RelatedIndicator): string => {
  // 1) 优先用「指标分布」接口按 indicatorId 匹配到的路径
  const fromMap = indicator.indicatorId ? props.indicatorPaths?.[indicator.indicatorId] : ''
  if (fromMap) return fromMap

  // 2) 指标本身若带路径则直接用
  if (indicator.relatedIndicator) return indicator.relatedIndicator

  // 3) 兜底：该风险只关联一个指标时，用风险顶层的 relatedIndicator 路径
  const indicators = dedupeIndicators(risk.relatedIndicators)
  if (indicators.length === 1 && risk.relatedIndicator) return risk.relatedIndicator

  return ''
}

// 路径拆分为层级片段，用于面包屑展示
const pathSegments = (risk: RiskVO, indicator: RelatedIndicator): string[] => {
  const path = resolveIndicatorPath(risk, indicator)
  if (!path) return []
  return path
    .split('>')
    .map(seg => seg.trim())
    .filter(Boolean)
}

// 是否主要触发（兼容后端 primaryTrigger 与旧字段 isPrimaryTrigger）
const isPrimaryTrigger = (indicator: RelatedIndicator): boolean => {
  return Boolean(indicator.primaryTrigger ?? indicator.isPrimaryTrigger)
}

// 得分格式化（保留两位小数，整数则去掉小数位）
const formatScore = (score?: number | null): string => {
  if (score == null || Number.isNaN(Number(score))) return '-'
  const num = Number(score)
  return Number.isInteger(num) ? String(num) : num.toFixed(2)
}

// 分数样式：分数越低代表合规水平越差、风险越高
const getScoreClass = (score?: number | null, maxScore?: number | null, threshold?: number | null) => {
  if (score == null || Number.isNaN(Number(score))) return ''

  const base = maxScore ?? threshold
  if (!base || base <= 0) return ''

  const ratio = Number(score) / Number(base)
  if (ratio < 0.2) return 'score-danger'
  if (ratio < 0.4) return 'score-warning'
  return 'score-safe'
}

// 导出报告
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}
</script>

<style scoped>
.risk-report {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
}

.report-card {
  border-radius: 8px;
  border: none;
}

.risk-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid;
}

.stat-card.total {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-left-color: #2196f3;
}

.stat-card.high {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border-left-color: #f44336;
}

.stat-card.medium {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-left-color: #ff9800;
}

.stat-card.low {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-left-color: #4caf50;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  font-family: 'Arial', sans-serif;
}

.risk-list {
  margin-top: 20px;
}

.risk-table-header {
  display: grid;
  grid-template-columns: 96px minmax(0, 4fr) 120px 96px;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  background: #f5f7fa;
  color: #606266;
  font-size: 13px;
  font-weight: 600;
}

.risk-list :deep(.el-collapse-item__header) {
  height: auto;
  min-height: 48px;
  line-height: 1.5;
  padding: 10px 0;
  align-items: flex-start;
}

.risk-title {
  display: grid;
  grid-template-columns: 96px minmax(0, 4fr) 120px 96px;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
  padding-right: 8px;
}

.risk-tag {
  min-width: 70px;
  text-align: center;
  font-weight: bold;
}

.risk-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  line-height: 1.5;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.risk-dimension {
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.risk-status {
  display: flex;
  align-items: center;
}

.risk-detail {
  padding: 16px;
  background: #fafafa;
}

.related-section {
  margin-top: 20px;
}

.related-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.behavior-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.behavior-item {
  position: relative;
  padding: 8px 12px 8px 28px;
  margin-bottom: 8px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-left: 3px solid #409eff;
  border-radius: 4px;
  font-size: 13px;
  color: #303133;
  line-height: 1.6;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.behavior-item::before {
  content: '•';
  position: absolute;
  left: 12px;
  color: #409eff;
  font-weight: bold;
}

.behavior-item:last-child {
  margin-bottom: 0;
}

.indicator-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 2px 0;
}

.indicator-label {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  line-height: 1.5;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.indicator-path {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  line-height: 1.5;
  color: #909399;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.path-seg {
  color: #909399;
}

.path-seg.is-leaf {
  color: #409eff;
  font-weight: 600;
}

.path-sep {
  color: #c0c4cc;
}

.score-danger {
  color: #f56c6c;
  font-weight: bold;
}

.score-warning {
  color: #e6a23c;
  font-weight: bold;
}

.score-safe {
  color: #67c23a;
  font-weight: bold;
}
</style>
