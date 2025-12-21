<template>
  <div class="assessment-result-container">
    <AppHeader />
    <div class="main-content">
      <div class="page-header">
        <h2>产品法律风险体系指标评估结果</h2>
        <div class="actions">
          <el-select v-model="selectedRiskLevel" placeholder="风险等级筛选" style="width: 150px; margin-right: 10px;">
            <el-option label="全部等级" value="" />
            <el-option label="高风险" value="高" />
            <el-option label="中风险" value="中" />
            <el-option label="低风险" value="低" />
          </el-select>
          <el-button type="primary" @click="exportReport">导出报告</el-button>
        </div>
      </div>

      <el-card class="result-card" shadow="hover">
        <el-table
          :data="filteredData"
          style="width: 100%; margin-bottom: 20px;"
          row-key="id"
          border
          default-expand-all
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          :row-class-name="tableRowClassName"
          header-cell-class-name="table-header"
          :indent="24"
        >
          <el-table-column prop="name" label="指标名称" min-width="250">
            <template #default="scope">
              <span :class="getLevelClass(scope.row.indicator_level)">{{ scope.row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="description" label="评价方法/内容" min-width="250">
             <template #default="scope">
               <div v-if="scope.row.indicator_level === 3" class="description-text">
                 {{ scope.row.description }}
               </div>
             </template>
          </el-table-column>

          <el-table-column label="合规风险来源" min-width="300">
            <template #default="scope">
              <div v-if="scope.row.related_regulations && scope.row.related_regulations.length > 0">
                <div v-for="(reg, index) in scope.row.related_regulations" :key="index" class="regulation-item">
                  <el-icon class="regulation-icon"><Document /></el-icon>
                  {{ reg.compliance_requirement }}
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="得分" width="100" align="center">
            <template #default="scope">
              <div v-if="scope.row.indicator_level === 3" class="score-cell">
                <span :class="getScoreClass(scope.row.score, scope.row.max_score)">{{ scope.row.score }}</span>
                <span class="max-score">/ {{ scope.row.max_score }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="评估结果" width="120" align="center">
             <template #default="scope">
                <el-tag
                  :type="getRiskLevelType(scope.row.risk_level)"
                  v-if="scope.row.risk_level"
                  effect="dark"
                  class="risk-tag"
                >
                  {{ scope.row.risk_level }}风险
                </el-tag>
             </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Document } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import type { EsIndicator, EsRisk } from '@/types/es_types'
import { mockIndicators, mockRisks } from '@/mock/assessmentData'

/**
 * 前端展示用的聚合结构，用于树形表格展示
 * 基础字段继承自 EsIndicator (对应 es_mappings.json 中的 t_indicator)
 * 额外字段说明：
 * - children: 仅用于前端树形结构展示，非ES存储字段，由前端根据 parent_indicator_id 构建
 * - risk_level: 来自 t_risk.risk_level，用于显示评估结果
 * - score: 来自 t_risk.related_indicators.score，用于显示得分
 * - related_regulations: 来自 t_risk.related_regulations，用于显示相关法规
 */
interface IndicatorNode extends EsIndicator {
  // 前端树形结构展示用，由 buildTree 函数根据 parent_indicator_id 构建
  children?: IndicatorNode[];
  // 以下字段来自 t_risk 结构，用于展示评估结果
  risk_level?: string;
  score?: number;
  related_regulations?: Array<{
    regulation_id: string;
    regulation_name: string;
    violation_type: string;
    compliance_requirement: string;
  }>;
}

const tableData = ref<IndicatorNode[]>([])
const selectedRiskLevel = ref('')

/**
 * 将扁平的指标数据转换为树形结构
 * @param flatData 后端返回的扁平数据（通过 parent_indicator_id 关联）
 * @returns 树形结构数据
 */
const buildTree = (flatData: IndicatorNode[]): IndicatorNode[] => {
  const map = new Map<string, IndicatorNode>()
  const roots: IndicatorNode[] = []

  // 第一遍：创建所有节点的映射
  flatData.forEach(item => {
    map.set(item.id, { ...item, children: [] })
  })

  // 第二遍：构建父子关系
  flatData.forEach(item => {
    const node = map.get(item.id)!
    if (item.parent_indicator_id === null || item.parent_indicator_id === '') {
      // 根节点
      roots.push(node)
    } else {
      // 子节点，找到父节点并添加
      const parent = map.get(item.parent_indicator_id)
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(node)
      } else {
        // 如果找不到父节点，将其作为根节点
        console.warn(`找不到父节点 ${item.parent_indicator_id}，将 ${item.id} 作为根节点`)
        roots.push(node)
      }
    }
  })

  // 清理空的 children 数组并设置 hasChildren 属性
  const cleanEmptyChildren = (nodes: IndicatorNode[]) => {
    nodes.forEach(node => {
      if (node.children && node.children.length === 0) {
        delete node.children
        delete (node as any).hasChildren
      } else if (node.children && node.children.length > 0) {
        (node as any).hasChildren = true
        cleanEmptyChildren(node.children)
      }
    })
  }
  cleanEmptyChildren(roots)

  return roots
}

/**
 * 将指标数据与风险评估结果合并
 * @param indicators 指标数据（来自 t_indicator）
 * @param risks 风险评估结果（来自 t_risk）
 * @returns 合并后的数据，用于前端展示
 */
const mergeIndicatorsWithRisks = (indicators: EsIndicator[], risks: EsRisk[]): IndicatorNode[] => {
  // 构建指标ID到风险数据的映射
  const riskMap = new Map<string, EsRisk>()
  risks.forEach(risk => {
    // 通过 related_indicators 找到对应的指标
    risk.related_indicators.forEach(relatedIndicator => {
      if (relatedIndicator.is_primary_trigger) {
        riskMap.set(relatedIndicator.indicator_id, risk)
      }
    })
  })

  // 合并数据
  return indicators.map(indicator => {
    const risk = riskMap.get(indicator.id)
    const relatedIndicator = risk?.related_indicators.find(ri => ri.indicator_id === indicator.id)

    return {
      ...indicator,
      risk_level: risk?.risk_level,
      score: relatedIndicator?.score,
      related_regulations: risk?.related_regulations
    } as IndicatorNode
  })
}

const filterByRiskLevel = (nodes: IndicatorNode[], level: string): IndicatorNode[] => {
  if (!level) return nodes

  const result: IndicatorNode[] = []

  for (const node of nodes) {
    const children = node.children ? filterByRiskLevel(node.children, level) : []
    const isMatch = node.risk_level === level

    if (isMatch || children.length > 0) {
      result.push({
        ...node,
        children: children.length > 0 ? children : undefined
      })
    }
  }

  return result
}

const filteredData = computed(() => {
  return filterByRiskLevel(tableData.value, selectedRiskLevel.value)
})

const getLevelClass = (level: number) => {
  return `level-${level}`
}

const tableRowClassName = ({ row }: { row: IndicatorNode }) => {
  if (row.risk_level === '高') {
    return 'high-risk-row'
  } else if (row.risk_level === '中') {
    return 'medium-risk-row'
  }
  return ''
}

const getScoreClass = (score: number, maxScore: number) => {
  const ratio = score / maxScore
  if (ratio < 0.6) return 'score-low'
  if (ratio < 0.8) return 'score-medium'
  return 'score-high'
}

onMounted(() => {
  // 1. 合并指标数据与风险评估结果
  const mergedData = mergeIndicatorsWithRisks(mockIndicators, mockRisks)
  // 2. 将扁平数据转换为树形结构
  tableData.value = buildTree(mergedData)

  // 调试：打印树形结构
  console.log('Tree structure:', JSON.stringify(tableData.value, null, 2))
})

const getRiskLevelType = (level?: string) => {
  switch (level) {
    case '高':
      return 'danger'
    case '中':
      return 'warning'
    case '低':
      return 'success'
    default:
      return 'info'
  }
}

const exportReport = () => {
  console.log('Exporting report...')
  // TODO: Implement export logic
}
</script>

<style scoped>
.assessment-result-container {
  min-height: 100vh;
  background-color: #f0f2f5;
}

.main-content {
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.page-header h2 {
  margin: 0;
  color: #1f2f3d;
  font-weight: 600;
  font-size: 20px;
}

.result-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

:deep(.high-risk-row:hover > td) {
  background-color: #fde2e2 !important;
}

:deep(.medium-risk-row:hover > td) {
  background-color: #faecd8 !important;
}

.description-text {
  font-size: 13px;
  line-height: 1.6;
  color: #606266;
}

.regulation-item {
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
  display: flex;
  align-items: flex-start;
  background: #f4f4f5;
  padding: 8px;
  border-radius: 4px;
}

.regulation-item:last-child {
  margin-bottom: 0;
}

.regulation-icon {
  margin-right: 6px;
  margin-top: 3px;
  color: #909399;
}

.score-cell {
  font-family: 'Roboto', sans-serif;
}

.max-score {
  font-size: 12px;
  color: #909399;
  margin-left: 2px;
}

.risk-tag {
  min-width: 60px;
  font-weight: bold;
}

/* 树形表格层级样式 */
.level-1 {
  font-weight: 600;
  font-size: 15px;
  color: #303133;
}

.level-2 {
  font-weight: 500;
  font-size: 14px;
  color: #606266;
}

.level-3 {
  font-weight: 400;
  font-size: 13px;
  color: #606266;
}

/* 分数显示样式 */
.score-low {
  color: #f56c6c;
  font-weight: bold;
}

.score-medium {
  color: #e6a23c;
  font-weight: bold;
}

.score-high {
  color: #67c23a;
  font-weight: bold;
}

/* 确保 Element Plus 树形表格的缩进正确应用 */
:deep(.el-table__body .el-table__row .el-table__cell:first-child .cell) {
  display: flex;
  align-items: center;
}

/* 强制应用 Element Plus 树形结构的缩进 */
:deep(.el-table__indent) {
  padding-left: 0 !important;
}

/* 确保每个层级的缩进正确显示 */
:deep(.el-table__placeholder) {
  display: inline-block;
  width: 18px;
  min-width: 18px;
}

/* 表格单元格样式，确保内容正确显示 */
:deep(.el-table .cell) {
  word-break: break-word;
  line-height: 1.6;
}

/* 确保树形表格的展开图标和内容对齐 */
:deep(.el-table__expand-icon) {
  margin-right: 8px;
}
</style>

