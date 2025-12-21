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
  // ========== 产品合规风险 (dimension: '产品合规风险') ==========
  // 一级指标
  {
    id: '1',
    name: '1. 产品设计开发合规风险',
    description: '产品设计开发合规风险',
    type: 'risk_category',
    indicator_level: 1,
    parent_indicator_id: null,
    dimension: '产品合规风险',
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
    dimension: '产品合规风险',
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
    dimension: '产品合规风险',
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
    dimension: '产品合规风险',
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
    dimension: '产品合规风险',
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
    dimension: '产品合规风险',
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
    dimension: '产品合规风险',
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
    dimension: '产品合规风险',
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
    dimension: '产品合规风险',
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
    dimension: '产品合规风险',
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
    dimension: '产品合规风险',
    industry: ['电子'],
    region: 'CN',
    tags: ['污染控制'],
    max_score: 10,
    calculation_rule: { rule_type: 'binary' },
    risk_rule: { description: '高风险' },
    created_at: '2023-10-27T10:00:00Z'
  },

  // ========== 企业关联方风险 (dimension: '企业关联方风险') ==========
  {
    id: '2',
    name: '2. 关联方交易风险',
    description: '企业关联方交易相关风险评估',
    type: 'risk_category',
    indicator_level: 1,
    parent_indicator_id: null,
    dimension: '企业关联方风险',
    industry: ['通用'],
    region: 'CN',
    tags: ['关联交易'],
    max_score: 100,
    calculation_rule: { rule_type: 'sum' },
    risk_rule: { description: '中风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: '2.1',
    name: '2.1 关联交易合规性',
    description: '关联交易合规性评估',
    type: 'risk_subcategory',
    indicator_level: 2,
    parent_indicator_id: '2',
    dimension: '企业关联方风险',
    industry: ['通用'],
    region: 'CN',
    tags: ['合规'],
    max_score: 100,
    calculation_rule: { rule_type: 'sum' },
    risk_rule: { description: '中风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: '2.1.1',
    name: '2.1.1 关联交易披露是否符合《公司法》及证监会相关规定',
    description: '检查关联交易信息披露的完整性和及时性',
    type: 'indicator',
    indicator_level: 3,
    parent_indicator_id: '2.1',
    dimension: '企业关联方风险',
    industry: ['通用'],
    region: 'CN',
    tags: ['披露'],
    max_score: 10,
    calculation_rule: { rule_type: 'binary' },
    risk_rule: { description: '高风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: '2.1.2',
    name: '2.1.2 关联交易定价是否公允',
    description: '评估关联交易价格是否符合市场公允价值',
    type: 'indicator',
    indicator_level: 3,
    parent_indicator_id: '2.1',
    dimension: '企业关联方风险',
    industry: ['通用'],
    region: 'CN',
    tags: ['定价'],
    max_score: 10,
    calculation_rule: { rule_type: 'range' },
    risk_rule: { description: '中风险' },
    created_at: '2023-10-27T10:00:00Z'
  },

  // ========== 劳务合规风险 (dimension: '劳务合规风险') ==========
  {
    id: '3',
    name: '3. 劳动用工合规风险',
    description: '劳动用工相关法律合规风险',
    type: 'risk_category',
    indicator_level: 1,
    parent_indicator_id: null,
    dimension: '劳务合规风险',
    industry: ['通用'],
    region: 'CN',
    tags: ['劳动', '用工'],
    max_score: 100,
    calculation_rule: { rule_type: 'sum' },
    risk_rule: { description: '中风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: '3.1',
    name: '3.1 劳动合同管理',
    description: '劳动合同签订与管理评估',
    type: 'risk_subcategory',
    indicator_level: 2,
    parent_indicator_id: '3',
    dimension: '劳务合规风险',
    industry: ['通用'],
    region: 'CN',
    tags: ['合同'],
    max_score: 100,
    calculation_rule: { rule_type: 'sum' },
    risk_rule: { description: '中风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: '3.1.1',
    name: '3.1.1 劳动合同签订率是否达到100%',
    description: '检查所有在职员工是否均已签订书面劳动合同',
    type: 'indicator',
    indicator_level: 3,
    parent_indicator_id: '3.1',
    dimension: '劳务合规风险',
    industry: ['通用'],
    region: 'CN',
    tags: ['签订率'],
    max_score: 10,
    calculation_rule: { rule_type: 'range' },
    risk_rule: { description: '高风险' },
    created_at: '2023-10-27T10:00:00Z'
  },

  // ========== 企业信用风险 (dimension: '企业信用风险') ==========
  {
    id: '4',
    name: '4. 企业信用评估风险',
    description: '企业信用状况评估',
    type: 'risk_category',
    indicator_level: 1,
    parent_indicator_id: null,
    dimension: '企业信用风险',
    industry: ['通用'],
    region: 'CN',
    tags: ['信用'],
    max_score: 100,
    calculation_rule: { rule_type: 'sum' },
    risk_rule: { description: '中风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: '4.1',
    name: '4.1 信用记录评估',
    description: '企业信用记录情况',
    type: 'risk_subcategory',
    indicator_level: 2,
    parent_indicator_id: '4',
    dimension: '企业信用风险',
    industry: ['通用'],
    region: 'CN',
    tags: ['记录'],
    max_score: 100,
    calculation_rule: { rule_type: 'sum' },
    risk_rule: { description: '中风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: '4.1.1',
    name: '4.1.1 是否存在失信被执行人记录',
    description: '检查企业是否被列入失信被执行人名单',
    type: 'indicator',
    indicator_level: 3,
    parent_indicator_id: '4.1',
    dimension: '企业信用风险',
    industry: ['通用'],
    region: 'CN',
    tags: ['失信'],
    max_score: 10,
    calculation_rule: { rule_type: 'binary' },
    risk_rule: { description: '高风险' },
    created_at: '2023-10-27T10:00:00Z'
  },

  // ========== 企业国际合作风险 (dimension: '企业国际合作风险') ==========
  {
    id: '5',
    name: '5. 国际合作合规风险',
    description: '国际业务合作合规风险评估',
    type: 'risk_category',
    indicator_level: 1,
    parent_indicator_id: null,
    dimension: '企业国际合作风险',
    industry: ['通用'],
    region: 'CN',
    tags: ['国际', '合作'],
    max_score: 100,
    calculation_rule: { rule_type: 'sum' },
    risk_rule: { description: '中风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: '5.1',
    name: '5.1 出口管制合规',
    description: '出口管制相关合规评估',
    type: 'risk_subcategory',
    indicator_level: 2,
    parent_indicator_id: '5',
    dimension: '企业国际合作风险',
    industry: ['通用'],
    region: 'CN',
    tags: ['出口'],
    max_score: 100,
    calculation_rule: { rule_type: 'sum' },
    risk_rule: { description: '高风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: '5.1.1',
    name: '5.1.1 是否建立出口管制内部合规制度',
    description: '检查企业是否按照《出口管制法》要求建立内部合规制度',
    type: 'indicator',
    indicator_level: 3,
    parent_indicator_id: '5.1',
    dimension: '企业国际合作风险',
    industry: ['通用'],
    region: 'CN',
    tags: ['合规制度'],
    max_score: 10,
    calculation_rule: { rule_type: 'binary' },
    risk_rule: { description: '高风险' },
    created_at: '2023-10-27T10:00:00Z'
  },

  // ========== 供应链风险 (dimension: '供应链风险') ==========
  {
    id: '6',
    name: '6. 供应链管理风险',
    description: '供应链管理相关风险评估',
    type: 'risk_category',
    indicator_level: 1,
    parent_indicator_id: null,
    dimension: '供应链风险',
    industry: ['通用'],
    region: 'CN',
    tags: ['供应链'],
    max_score: 100,
    calculation_rule: { rule_type: 'sum' },
    risk_rule: { description: '中风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: '6.1',
    name: '6.1 供应商资质审核',
    description: '供应商资质及合规性审核',
    type: 'risk_subcategory',
    indicator_level: 2,
    parent_indicator_id: '6',
    dimension: '供应链风险',
    industry: ['通用'],
    region: 'CN',
    tags: ['供应商'],
    max_score: 100,
    calculation_rule: { rule_type: 'sum' },
    risk_rule: { description: '中风险' },
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: '6.1.1',
    name: '6.1.1 核心供应商是否完成合规背景调查',
    description: '检查核心供应商的合规背景调查完成情况',
    type: 'indicator',
    indicator_level: 3,
    parent_indicator_id: '6.1',
    dimension: '供应链风险',
    industry: ['通用'],
    region: 'CN',
    tags: ['背景调查'],
    max_score: 10,
    calculation_rule: { rule_type: 'range' },
    risk_rule: { description: '中风险' },
    created_at: '2023-10-27T10:00:00Z'
  }
]

/**
 * 模拟后端返回的风险评估结果数据
 * 严格按照 es_mappings.json 中 t_risk 的结构
 */
export const mockRisks: EsRisk[] = [
  // ========== 产品合规风险 ==========
  {
    id: 'risk_1',
    project_id: 1,
    assessment_id: 1,
    name: '产品质量法合规风险',
    dimension: '产品合规风险',
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
    dimension: '产品合规风险',
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
    dimension: '产品合规风险',
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
    dimension: '产品合规风险',
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
    dimension: '产品合规风险',
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
    dimension: '产品合规风险',
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
    dimension: '产品合规风险',
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
  },

  // ========== 企业关联方风险 ==========
  {
    id: 'risk_8',
    project_id: 1,
    assessment_id: 1,
    name: '关联交易披露风险',
    dimension: '企业关联方风险',
    description: '关联交易信息披露合规性评估',
    risk_level: '高',
    probability: 4,
    impact: 4,
    detectability: 3,
    status: 'identified',
    responsible_party: '财务部',
    affected_objects: '企业',
    impact_scope: '监管',
    countermeasures: '完善披露机制',
    triggered_by_rule: {
      rule_id: 'rule_008',
      rule_description: '关联交易披露检查',
      trigger_condition: 'score < 6'
    },
    related_indicators: [
      {
        indicator_id: '2.1.1',
        indicator_name: '关联交易披露是否符合《公司法》及证监会相关规定',
        score: 4,
        threshold: 6,
        is_primary_trigger: true
      }
    ],
    related_regulations: [
      {
        regulation_id: 'reg_006',
        regulation_name: '公司法',
        violation_type: '合规',
        compliance_requirement: '《公司法》第二十一条 公司的控股股东、实际控制人、董事、监事、高级管理人员不得利用其关联关系损害公司利益。'
      }
    ],
    created_at: '2023-10-27T10:00:00Z'
  },
  {
    id: 'risk_9',
    project_id: 1,
    assessment_id: 1,
    name: '关联交易定价风险',
    dimension: '企业关联方风险',
    description: '关联交易定价公允性评估',
    risk_level: '中',
    probability: 3,
    impact: 3,
    detectability: 3,
    status: 'identified',
    responsible_party: '财务部',
    affected_objects: '财务',
    impact_scope: '企业',
    countermeasures: '建立独立定价机制',
    triggered_by_rule: {
      rule_id: 'rule_009',
      rule_description: '定价公允性检查',
      trigger_condition: 'score < 8'
    },
    related_indicators: [
      {
        indicator_id: '2.1.2',
        indicator_name: '关联交易定价是否公允',
        score: 7,
        threshold: 8,
        is_primary_trigger: true
      }
    ],
    related_regulations: [],
    created_at: '2023-10-27T10:00:00Z'
  },

  // ========== 劳务合规风险 ==========
  {
    id: 'risk_10',
    project_id: 1,
    assessment_id: 1,
    name: '劳动合同签订风险',
    dimension: '劳务合规风险',
    description: '劳动合同签订率评估',
    risk_level: '高',
    probability: 4,
    impact: 4,
    detectability: 2,
    status: 'identified',
    responsible_party: '人力资源部',
    affected_objects: '员工',
    impact_scope: '企业',
    countermeasures: '立即补签劳动合同',
    triggered_by_rule: {
      rule_id: 'rule_010',
      rule_description: '劳动合同签订率检查',
      trigger_condition: 'score < 10'
    },
    related_indicators: [
      {
        indicator_id: '3.1.1',
        indicator_name: '劳动合同签订率是否达到100%',
        score: 8,
        threshold: 10,
        is_primary_trigger: true
      }
    ],
    related_regulations: [
      {
        regulation_id: 'reg_007',
        regulation_name: '劳动合同法',
        violation_type: '合规',
        compliance_requirement: '《劳动合同法》第十条 建立劳动关系，应当订立书面劳动合同。已建立劳动关系，未同时订立书面劳动合同的，应当自用工之日起一个月内订立书面劳动合同。'
      }
    ],
    created_at: '2023-10-27T10:00:00Z'
  },

  // ========== 企业信用风险 ==========
  {
    id: 'risk_11',
    project_id: 1,
    assessment_id: 1,
    name: '失信被执行人风险',
    dimension: '企业信用风险',
    description: '企业失信记录评估',
    risk_level: '低',
    probability: 1,
    impact: 5,
    detectability: 1,
    status: 'identified',
    responsible_party: '法务部',
    affected_objects: '企业',
    impact_scope: '声誉',
    countermeasures: '保持良好信用记录',
    triggered_by_rule: {
      rule_id: 'rule_011',
      rule_description: '失信记录检查',
      trigger_condition: 'score = 0'
    },
    related_indicators: [
      {
        indicator_id: '4.1.1',
        indicator_name: '是否存在失信被执行人记录',
        score: 10,
        threshold: 10,
        is_primary_trigger: true
      }
    ],
    related_regulations: [],
    created_at: '2023-10-27T10:00:00Z'
  },

  // ========== 企业国际合作风险 ==========
  {
    id: 'risk_12',
    project_id: 1,
    assessment_id: 1,
    name: '出口管制合规风险',
    dimension: '企业国际合作风险',
    description: '出口管制内部合规制度评估',
    risk_level: '高',
    probability: 4,
    impact: 5,
    detectability: 3,
    status: 'identified',
    responsible_party: '合规部',
    affected_objects: '业务',
    impact_scope: '国际',
    countermeasures: '建立出口管制合规制度',
    triggered_by_rule: {
      rule_id: 'rule_012',
      rule_description: '出口管制制度检查',
      trigger_condition: 'score = 0'
    },
    related_indicators: [
      {
        indicator_id: '5.1.1',
        indicator_name: '是否建立出口管制内部合规制度',
        score: 0,
        threshold: 10,
        is_primary_trigger: true
      }
    ],
    related_regulations: [
      {
        regulation_id: 'reg_008',
        regulation_name: '出口管制法',
        violation_type: '合规',
        compliance_requirement: '《出口管制法》第十四条 出口经营者应当建立出口管制内部合规制度，运行情况良好且没有重大违法记录的，国家出口管制管理部门可以对其出口有关管制物项给予通用许可等便利措施。'
      }
    ],
    created_at: '2023-10-27T10:00:00Z'
  },

  // ========== 供应链风险 ==========
  {
    id: 'risk_13',
    project_id: 1,
    assessment_id: 1,
    name: '供应商背景调查风险',
    dimension: '供应链风险',
    description: '核心供应商背景调查完成情况评估',
    risk_level: '中',
    probability: 3,
    impact: 3,
    detectability: 3,
    status: 'identified',
    responsible_party: '采购部',
    affected_objects: '供应链',
    impact_scope: '业务',
    countermeasures: '加强供应商审核',
    triggered_by_rule: {
      rule_id: 'rule_013',
      rule_description: '供应商背景调查检查',
      trigger_condition: 'score < 8'
    },
    related_indicators: [
      {
        indicator_id: '6.1.1',
        indicator_name: '核心供应商是否完成合规背景调查',
        score: 7,
        threshold: 8,
        is_primary_trigger: true
      }
    ],
    related_regulations: [],
    created_at: '2023-10-27T10:00:00Z'
  }
]

