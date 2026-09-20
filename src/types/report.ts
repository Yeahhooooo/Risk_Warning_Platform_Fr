/**
 * 评估报告相关类型定义
 * 对应后端 risk-warning-report 模块的 VO 类型
 */

/**
 * 风险维度枚举
 */
export enum RiskDimensionEnum {
  ENTERPRISE_RELATED_RISK = '企业关联方风险',
  PRODUCT_LEGITIMACY_RISK = '产品合规风险',
  LABOR_LEGITIMACY_RISK = '劳务合规风险',
  ENTERPRISE_CREDIT_RISK = '企业信用风险',
  ENTERPRISE_INTERNATIONAL_COOPERATION_RISK = '企业国际合作风险',
  SUPPLY_CHAIN_RISK = '供应链风险'
}

/**
 * 风险等级枚举
 */
export enum RiskLevelEnum {
  HIGH_RISK = 'HIGH_RISK',
  MEDIUM_RISK = 'MEDIUM_RISK',
  LOW_RISK = 'LOW_RISK'
}

/**
 * 评估状态枚举
 */
export enum AssessmentStatusEnum {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

/**
 * 分数区间分布项
 * 对应后端 ScoreRatioDistributionItemVO
 */
export interface ScoreRatioDistributionItemVO {
  startScoreRatio: number
  endScoreRatio: number
  ratio: number
  totalScore: number
  totalCount: number
  riskTriggeredCount: number
  safeCount: number
}

/**
 * 指标分布统计
 * 对应后端 IndicatorDistributionVO
 */
export interface IndicatorDistributionVO {
  riskDimensionEnum: RiskDimensionEnum | null
  assessmentId: number
  totalScore: number
  maxScore?: number
  /** 命中指标明细（含完整层级路径 relatedIndicator） */
  indicatorScores?: IndicatorScoreVO[]
  totalCount: number
  riskTriggeredCount: number
  safeCount: number
  assessmentTime: string
  scoreDistributions: ScoreRatioDistributionItemVO[]
  dimensionDistributions: Record<string, IndicatorDistributionVO>
}

/**
 * 命中指标明细
 * 对应后端 IndicatorDistributionVO.indicatorScores
 * 注意：此处的 relatedBehaviors 是字符串数组，与风险清单里的对象数组不同
 */
export interface IndicatorScoreVO {
  indicatorId: string
  indicatorName: string
  dimension?: string
  /** 指标完整层级路径，如「产品法律风险 > 产品设计开发合规 > 产品标识与警示 > 产品标识管理制度」 */
  relatedIndicator?: string
  relatedBehaviors?: string[]
  score: number
  maxScore?: number
  riskLevel?: string
  riskTriggered?: boolean
}

/**
 * 相关法规
 */
export interface RelatedRegulation {
  regulationId: string
  regulationName: string
  violationType: string
  complianceRequirement: string
}

/**
 * 相关企业行为
 * 对应后端 RelatedBehavior
 */
export interface RelatedBehavior {
  behaviorId?: string
  projectId?: number
  description: string
  relatedRegulations?: RelatedRegulation[]
}

/**
 * 相关指标
 * 注意：后端实际字段为 maxScore（满分）与 primaryTrigger（是否主要触发），
 * threshold / isPrimaryTrigger 为兼容旧数据保留为可选字段。
 */
export interface RelatedIndicator {
  indicatorId: string
  indicatorName: string
  score: number
  /** 满分（后端字段） */
  maxScore?: number
  /** 风险阈值（部分接口返回，可能缺失） */
  threshold?: number
  /** 是否主要触发（后端字段） */
  primaryTrigger?: boolean
  /** 兼容旧字段名 */
  isPrimaryTrigger?: boolean
  /** 指标完整层级路径，如「产品法律风险 > 产品设计开发合规 > 产品标识与警示 > 产品标识管理制度」 */
  relatedIndicator?: string
  riskLevel?: string
  riskTriggered?: boolean
  dimension?: string
  relatedBehaviors?: RelatedBehavior[]
}

/**
 * 风险详情
 * 对应后端 RiskVO
 */
export interface RiskVO {
  id: string
  projectId: number
  assessmentId: number
  name: string
  dimension: string
  description: string
  riskLevel: string
  /** 风险得分 */
  score?: number
  /** 满分 */
  maxScore?: number
  probability: number
  impact: number
  detectability: number
  status: string
  responsibleParty: string
  affectedObjects: string[]
  impactScope: string
  countermeasures: string
  relatedIndicators: RelatedIndicator[]
  /** 该风险对应的指标完整层级路径（后端顶层字段，字符串） */
  relatedIndicator?: string
  /** 顶层相关法规，可能为 null，法规通常挂在 relatedBehaviors 里 */
  relatedRegulations?: RelatedRegulation[] | null
  createAt: string
  processingStatus?: string
}

/**
 * 总体评估结果
 * 对应后端 OverallResult
 */
export interface OverallResult {
  overallScore: number
  overallRiskLevel: RiskLevelEnum
  status: AssessmentStatusEnum
}

/**
 * 风险汇总
 * 对应后端 RiskSummary
 */
export interface RiskSummary {
  totalRisks: number
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
}

/**
 * 指标概览
 * 对应后端 IndicatorOverview
 */
export interface IndicatorOverview {
  behaviorIndicators: number
  questionnaireIndicators: number
  riskTriggeredIndicators: number
  safeIndicators: number
}

/**
 * 维度风险分布
 * 对应后端 DimensionRiskDistribution
 */
export interface DimensionRiskDistribution {
  dimension: string
  riskCount: number
  lowRiskCount: number
  mediumRiskCount: number
  highRiskCount: number
}

/**
 * 评估详情
 * 对应后端 AssessmentDetailVO
 */
export interface AssessmentDetailVO {
  projectId: number
  assessmentId: number
  assessmentDate: string
  overallResult: OverallResult
  riskSummary: RiskSummary
  indicatorOverview: IndicatorOverview
  dimensionRiskDistribution: Record<string, DimensionRiskDistribution>
}

