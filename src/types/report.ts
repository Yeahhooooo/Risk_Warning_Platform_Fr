/**
 * 评估报告相关类型定义
 * 对应后端 risk-warning-report 模块的 VO 类型
 */

/**
 * 风险维度枚举
 */
export enum RiskDimensionEnum {
  ENTERPRISE_RELATED_RISK = '企业关联方风险',
  PRODUCT_LEGITIMACY_RISK = '产品法律风险',
  LABOR_LEGITIMACY_RISK = '劳动法律风险',
  ENTERPRISE_CREDIT_RISK = '企业信用风险',
  ENTERPRISE_INTERNATIONAL_COOPERATION_RISK = '国际化经营风险',
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
  UPLOADING = 'UPLOADING',
  TO_BE_ASSESSED = 'TO_BE_ASSESSED',
  ASSESSING = 'ASSESSING',
  ASSESSED = 'ASSESSED',
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
  totalCount: number
  riskTriggeredCount: number
  safeCount: number
  assessmentTime: string
  scoreDistributions: ScoreRatioDistributionItemVO[]
  dimensionDistributions: Record<string, IndicatorDistributionVO>
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
 */
export interface RelatedIndicator {
  indicatorId: string
  indicatorName: string
  score: number
  threshold: number
  isPrimaryTrigger: boolean
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
  probability: number
  impact: number
  detectability: number
  status: string
  responsibleParty: string
  affectedObjects: string[]
  impactScope: string
  countermeasures: string
  relatedIndicators: RelatedIndicator[]
  relatedRegulations: RelatedRegulation[]
  createAt: string
  processingStatus?: string
}

/**
 * 总体评估结果
 * 对应后端 OverallResult
 */
export interface OverallResult {
  overallScore: number | null
  overallRiskLevel: RiskLevelEnum | null
  status: AssessmentStatusEnum
  failureCode: string | null
  failureReason: string | null
  failureStage: string | null
  failedAt: string | null
}

/** Database-only status endpoint and parsed notification extraData. */
export interface AssessmentStatusResponse extends Pick<OverallResult, 'status' | 'failureCode' | 'failureReason' | 'failureStage' | 'failedAt'> {
  assessmentId: number
  projectId: number
}

export const assessmentFailureStageLabels: Record<string, string> = {
  UPLOAD_INIT: '上传初始化',
  UPLOAD_CHUNK: '分片上传',
  UPLOAD_CONFIRM: '确认上传',
  UPLOAD_CANCELLED: '取消上传',
  ASSESSMENT_TIMEOUT: '上传或评估超时',
  FILE_MERGE: '上传文件合并',
  BEHAVIOR_PROCESSING: '材料解析与行为分析',
  INDICATOR_CALCULATION: '指标计算',
  REPORT_AGGREGATION: '报告汇总'
}

/**
 * 风险汇总
 * 对应后端 RiskSummary
 */
export interface RiskSummary {
  totalRisks: number | null
  highRiskCount: number | null
  mediumRiskCount: number | null
  lowRiskCount: number | null
}

/**
 * 指标概览
 * 对应后端 IndicatorOverview
 */
export interface IndicatorOverview {
  behaviorIndicators: number | null
  questionnaireIndicators: number | null
  riskTriggeredIndicators: number | null
  safeIndicators: number | null
}

/**
 * 维度风险分布
 * 对应后端 DimensionRiskDistribution
 */
export interface DimensionRiskDistribution {
  dimension: string | null
  riskCount: number | null
  lowRiskCount: number | null
  mediumRiskCount: number | null
  highRiskCount: number | null
}

/**
 * 评估详情
 * 对应后端 AssessmentDetailVO
 */
export interface AssessmentDetailVO {
  projectId: number
  assessmentId: number
  assessmentDate: string | null
  overallResult: OverallResult
  riskSummary: RiskSummary | null
  indicatorOverview: IndicatorOverview | null
  dimensionRiskDistribution: Record<string, DimensionRiskDistribution> | null
}

