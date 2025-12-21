/**
 * 评估结果模拟数据
 * 包含指标数据（mockIndicators）和风险评估结果数据（mockRisks）
 */

import type { EsIndicator, EsRisk } from '@/types/es_types'

/**
 * 模拟后端返回的指标数据
 * 严格按照 es_mappings.json 中 t_indicator 的结构
 * 通过 parent_indicator_id 表示层级关系
 */
export const mockIndicators: EsIndicator[] = [
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
export const mockRisks: EsRisk[] = [
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

