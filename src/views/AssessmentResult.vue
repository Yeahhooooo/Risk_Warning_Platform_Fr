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

/**
 * 模拟后端返回的指标数据
 * 严格按照 es_mappings.json 中 t_indicator 的结构
 * 通过 parent_indicator_id 表示层级关系
 */
const mockIndicators: EsIndicator[] = [
  // 一级指标
  {
    id: '1',
    name: '1. 产品设计开发合规风险',
    description: '产品设计开发合规风险',
    type: 'risk_category',
    indicator_level: 1,
    parent_indicator_id: null,
    dimension: '合规',
    industry: ['通用'],
    region: 'CN',
    tags: ['设计', '开发'],
    max_score: 100,
    calculation_rule: { rule_type: 'sum' },
    risk_rule: { description: '高风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  // 二级指标
  {
    id: '1.1',
    name: '1.1 基础法规符合性',
    description: '基础法规符合性',
    type: 'risk_subcategory',
    indicator_level: 2,
    parent_indicator_id: '1',
    dimension: '合规',
    industry: ['通用'],
    region: 'CN',
    tags: ['法规'],
    max_score: 100,
    calculation_rule: { rule_type: 'sum' },
    risk_rule: { description: '中风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: '1.2',
    name: '1.2 国家标准适配性',
    description: '国家标准适配性',
    type: 'risk_subcategory',
    indicator_level: 2,
    parent_indicator_id: '1',
    dimension: '合规',
    industry: ['通用'],
    region: 'CN',
    tags: ['国标'],
    max_score: 100,
    calculation_rule: { rule_type: 'sum' },
    risk_rule: { description: '中风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: '1.3',
    name: '1.3 有害物质管控',
    description: '有害物质管控',
    type: 'risk_subcategory',
    indicator_level: 2,
    parent_indicator_id: '1',
    dimension: '合规',
    industry: ['电子'],
    region: 'CN',
    tags: ['有害物质'],
    max_score: 100,
    calculation_rule: { rule_type: 'sum' },
    risk_rule: { description: '高风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  // 三级指标 - 1.1.x
  {
    id: '1.1.1',
    name: '1.1.1 是否符合《产品质量法》第二十六条关于产品质量基本要求',
    description: '检查判断',
    type: 'indicator',
    indicator_level: 3,
    parent_indicator_id: '1.1',
    dimension: '合规',
    industry: ['通用'],
    region: 'CN',
    tags: ['质量法'],
    max_score: 10,
    calculation_rule: { rule_type: 'binary' },
    risk_rule: { description: '低风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: '1.1.2',
    name: '1.1.2 产品合规性审查覆盖率',
    description: '统计并计算接受审查的新产品数量与总数的比例。',
    type: 'indicator',
    indicator_level: 3,
    parent_indicator_id: '1.1',
    dimension: '合规',
    industry: ['通用'],
    region: 'CN',
    tags: ['审查'],
    max_score: 10,
    calculation_rule: { rule_type: 'range' },
    risk_rule: { description: '中风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: '1.1.3',
    name: '1.1.3 合规性违规事件频率（次数/年）',
    description: '记录并统计每年因违规而被投诉或处罚的产品相关事件次数。',
    type: 'indicator',
    indicator_level: 3,
    parent_indicator_id: '1.1',
    dimension: '合规',
    industry: ['通用'],
    region: 'CN',
    tags: ['违规'],
    max_score: 10,
    calculation_rule: { rule_type: 'range' },
    risk_rule: { description: '高风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  // 三级指标 - 1.2.x
  {
    id: '1.2.1',
    name: '1.2.1 生产是否符合国家强制性标准最新版本要求',
    description: '检查与国家标准要求的不符率有多少。',
    type: 'indicator',
    indicator_level: 3,
    parent_indicator_id: '1.2',
    dimension: '合规',
    industry: ['通用'],
    region: 'CN',
    tags: ['强制标准'],
    max_score: 10,
    calculation_rule: { rule_type: 'range' },
    risk_rule: { description: '高风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: '1.2.2',
    name: '1.2.2 产品研发/改造是否符合国家强制性标准最新版本要求',
    description: '检查与国家标准要求的不符率有多少。',
    type: 'indicator',
    indicator_level: 3,
    parent_indicator_id: '1.2',
    dimension: '合规',
    industry: ['通用'],
    region: 'CN',
    tags: ['研发'],
    max_score: 10,
    calculation_rule: { rule_type: 'range' },
    risk_rule: { description: '中风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: '1.2.3',
    name: '1.2.3 国家标准适配性问题整改周期（天数）',
    description: '记录并计算从问题发现到解决的平均时间。',
    type: 'indicator',
    indicator_level: 3,
    parent_indicator_id: '1.2',
    dimension: '合规',
    industry: ['通用'],
    region: 'CN',
    tags: ['整改'],
    max_score: 10,
    calculation_rule: { rule_type: 'range' },
    risk_rule: { description: '低风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  // 三级指标 - 1.3.x
  {
    id: '1.3.1',
    name: '1.3.1 设计电子信息产品时，是否符合《电子信息产品污染控制管理办法》要求，采用污染控制方案、材料和工艺',
    description: '检查判断',
    type: 'indicator',
    indicator_level: 3,
    parent_indicator_id: '1.3',
    dimension: '合规',
    industry: ['电子'],
    region: 'CN',
    tags: ['污染控制'],
    max_score: 10,
    calculation_rule: { rule_type: 'binary' },
    risk_rule: { description: '高风险' },
    created_at: '2023-10-27T10:00:00Z'
  }
]

/**
 * 模拟后端返回的风险评估结果数据
 * 严格按照 es_mappings.json 中 t_risk 的结构
 */
const mockRisks: EsRisk[] = [
  {
    id: 'risk_1',
    project_id: 1,
    assessment_id: 1,
    name: '产品质量法合规风险',
    dimension: '合规',
    description: '产品质量基本要求符合性评估',
    risk_level: '低',
    probability: 2,
    impact: 3,
    detectability: 2,
    status: 'identified',
    responsible_party: '质量部',
    affected_objects: '产品',
    impact_scope: '企业',
    countermeasures: '加强质量管控',
    triggered_by_rule: {
      rule_id: 'rule_001',
      rule_description: '质量法合规检查',
      trigger_condition: 'score < 6'
    },
    related_indicators: [
      {
        indicator_id: '1.1.1',
        indicator_name: '是否符合《产品质量法》第二十六条关于产品质量基本要求',
        score: 10,
        threshold: 6,
        is_primary_trigger: true
      }
    ],
    related_regulations: [
      {
        regulation_id: 'reg_001',
        regulation_name: '产品质量法',
        violation_type: '合规',
        compliance_requirement: '《产品质量法》第二十六条 生产者应当对其生产的产品质量负责。产品质量应当符合下列要求：(一)不存在危及人身、财产安全的不合理的危险，有保障人体健康和人身、财产安全的国家标准、行业标准的，应当符合该标准；(二)具备产品应当具备的使用性能，但是，对产品存在使用性能的瑕疵作出说明的除外；(三)符合在产品或者其包装上注明采用的产品标准，符合以产品说明、实物样品等方式表明的质量状况。'
      }
    ],
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: 'risk_2',
    project_id: 1,
    assessment_id: 1,
    name: '合规性审查覆盖率风险',
    dimension: '合规',
    description: '产品合规性审查覆盖率评估',
    risk_level: '中',
    probability: 3,
    impact: 3,
    detectability: 3,
    status: 'identified',
    responsible_party: '合规部',
    affected_objects: '产品',
    impact_scope: '企业',
    countermeasures: '扩大审查范围',
    triggered_by_rule: {
      rule_id: 'rule_002',
      rule_description: '审查覆盖率检查',
      trigger_condition: 'score < 8'
    },
    related_indicators: [
      {
        indicator_id: '1.1.2',
        indicator_name: '产品合规性审查覆盖率',
        score: 8,
        threshold: 8,
        is_primary_trigger: true
      }
    ],
    related_regulations: [],
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: 'risk_3',
    project_id: 1,
    assessment_id: 1,
    name: '违规事件频率风险',
    dimension: '合规',
    description: '合规性违规事件频率评估',
    risk_level: '高',
    probability: 4,
    impact: 4,
    detectability: 3,
    status: 'identified',
    responsible_party: '法务部',
    affected_objects: '企业',
    impact_scope: '企业',
    countermeasures: '加强合规培训',
    triggered_by_rule: {
      rule_id: 'rule_003',
      rule_description: '违规频率检查',
      trigger_condition: 'score < 6'
    },
    related_indicators: [
      {
        indicator_id: '1.1.3',
        indicator_name: '合规性违规事件频率（次数/年）',
        score: 4,
        threshold: 6,
        is_primary_trigger: true
      }
    ],
    related_regulations: [],
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: 'risk_4',
    project_id: 1,
    assessment_id: 1,
    name: '强制性标准符合风险',
    dimension: '合规',
    description: '国家强制性标准符合性评估',
    risk_level: '高',
    probability: 4,
    impact: 5,
    detectability: 2,
    status: 'identified',
    responsible_party: '研发部',
    affected_objects: '产品',
    impact_scope: '市场',
    countermeasures: '立即整改不符合项',
    triggered_by_rule: {
      rule_id: 'rule_004',
      rule_description: '强制标准检查',
      trigger_condition: 'score < 6'
    },
    related_indicators: [
      {
        indicator_id: '1.2.1',
        indicator_name: '生产是否符合国家强制性标准最新版本要求',
        score: 2,
        threshold: 6,
        is_primary_trigger: true
      }
    ],
    related_regulations: [
      {
        regulation_id: 'reg_002',
        regulation_name: '标准化法',
        violation_type: '合规',
        compliance_requirement: '《标准化法》第二十五条 不符合强制性标准的产品、服务，不得生产、销售、进口或者提供。'
      }
    ],
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: 'risk_5',
    project_id: 1,
    assessment_id: 1,
    name: '研发标准符合风险',
    dimension: '合规',
    description: '产品研发标准符合性评估',
    risk_level: '中',
    probability: 3,
    impact: 3,
    detectability: 3,
    status: 'identified',
    responsible_party: '研发部',
    affected_objects: '产品',
    impact_scope: '企业',
    countermeasures: '优化研发流程',
    triggered_by_rule: {
      rule_id: 'rule_005',
      rule_description: '研发标准检查',
      trigger_condition: 'score < 8'
    },
    related_indicators: [
      {
        indicator_id: '1.2.2',
        indicator_name: '产品研发/改造是否符合国家强制性标准最新版本要求',
        score: 6,
        threshold: 8,
        is_primary_trigger: true
      }
    ],
    related_regulations: [
      {
        regulation_id: 'reg_003',
        regulation_name: '标准化法',
        violation_type: '合规',
        compliance_requirement: '《标准化法》第二十八条 企业研制新产品、改进产品，进行技术改造，应当符合本法规定的标准化要求。'
      }
    ],
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: 'risk_6',
    project_id: 1,
    assessment_id: 1,
    name: '整改周期风险',
    dimension: '合规',
    description: '问题整改周期评估',
    risk_level: '低',
    probability: 2,
    impact: 2,
    detectability: 2,
    status: 'identified',
    responsible_party: '质量部',
    affected_objects: '流程',
    impact_scope: '企业',
    countermeasures: '保持现有整改效率',
    triggered_by_rule: {
      rule_id: 'rule_006',
      rule_description: '整改周期检查',
      trigger_condition: 'score < 6'
    },
    related_indicators: [
      {
        indicator_id: '1.2.3',
        indicator_name: '国家标准适配性问题整改周期（天数）',
        score: 9,
        threshold: 6,
        is_primary_trigger: true
      }
    ],
    related_regulations: [],
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: 'risk_7',
    project_id: 1,
    assessment_id: 1,
    name: '有害物质管控风险',
    dimension: '合规',
    description: '电子信息产品有害物质管控评估',
    risk_level: '高',
    probability: 5,
    impact: 5,
    detectability: 2,
    status: 'identified',
    responsible_party: '研发部',
    affected_objects: '产品',
    impact_scope: '市场',
    countermeasures: '重新评估材料和工艺',
    triggered_by_rule: {
      rule_id: 'rule_007',
      rule_description: '有害物质检查',
      trigger_condition: 'score = 0'
    },
    related_indicators: [
      {
        indicator_id: '1.3.1',
        indicator_name: '设计电子信息产品时，是否符合《电子信息产品污染控制管理办法》要求',
        score: 0,
        threshold: 10,
        is_primary_trigger: true
      }
    ],
    related_regulations: [
      {
        regulation_id: 'reg_004',
        regulation_name: '电子信息产品污染控制管理办法',
        violation_type: '合规',
        compliance_requirement: '《电子信息产品污染控制管理办法》第九条 电子信息产品设计者在设计电子信息产品时，应当符合电子信息产品有毒、有害物质或元素控制国家标准或行业标准，在满足工艺要求的前提下，采用无毒、无害或低毒、低害、易于降解、便于回收利用的方案。\n第十条 电子信息产品生产者在生产或制造电子信息产品时，应当符合电子信息产品有毒、有害物质或元素控制国家标准或行业标准，采用资源利用率高、易回收处理、有利于环保的材料、技术和工艺。'
      },
      {
        regulation_id: 'reg_005',
        regulation_name: '电子信息产品污染控制管理办法',
        violation_type: '合规',
        compliance_requirement: '《电子信息产品污染控制管理办法》第十三条 电子信息产品生产者、进口者应当对其投放市场的电子信息产品中含有的有毒、有害物质或元素进行标注，标明有毒、有害物质或元素的名称、含量、所在部件及其可否回收利用等；由于产品体积或功能的限制不能在产品上标注的，应当在产品说明书中注明。\n前款规定的标注样式和方式由信息产业部商国务院有关主管部门统一规定，标注的样式和方式应当符合国家标准或行业标准。'
      }
    ],
    created_at: '2023-10-27T10:00:00Z'
  }
]

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

