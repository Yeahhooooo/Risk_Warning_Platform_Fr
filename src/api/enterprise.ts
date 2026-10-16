import request from '@/utils/request'
import type { AssessmentDetailVO } from '@/types/report'
import type {
  Enterprise,
  EnterpriseCreateRequest,
  EnterpriseUpdateRequest,
  EnterpriseUserResponse,
  AddMemberRequest,
  Result
} from '@/types'

export function getLatestEnterpriseAssessment(name: string, silent = false): Promise<Result<AssessmentDetailVO | null>> {
  return request.get(`org/enterprise/${encodeURIComponent(name)}/assessment`, {
    silent,
    timeout: 20000
  })
}

// 创建企业
export function createEnterprise(data: EnterpriseCreateRequest): Promise<Result<Enterprise>> {
  return request.post('org/enterprise', data)
}

// 获取所有企业
export function getAllEnterprises(): Promise<Result<Enterprise[]>> {
  return request.get('org/enterprise')
}

// 添加企业成员
export function addEnterpriseMember(enterpriseId: number, data: AddMemberRequest): Promise<Result<void>> {
  return request.post(`org/enterprise/${enterpriseId}/members`, data)
}

// 获取企业成员列表
export function getEnterpriseMembers(enterpriseId: number, silent = false): Promise<Result<EnterpriseUserResponse[]>> {
  return request.get(`org/enterprise/${enterpriseId}/members`, { silent })
}

export function getEnterprise(id: number): Promise<Result<Enterprise>> {
  return request.get(`org/enterprise/${id}`)
}

export function updateEnterprise(id: number, data: EnterpriseUpdateRequest): Promise<Result<Enterprise>> {
  return request.patch(`org/enterprise/${id}`, data)
}

export function deleteEnterprise(id: number): Promise<Result<void>> {
  return request.delete(`org/enterprise/${id}`)
}
