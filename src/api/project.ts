import request from '@/utils/request'
import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectMemberResponse,
  AddMemberRequest,
  Assessment,
  Result
} from '@/types'

// 创建项目
export function createProject(data: ProjectCreateRequest): Promise<Result<Project>> {
  return request.post('org/project', data)
}

// 获取所有项目
export function getAllProjects(): Promise<Result<Project[]>> {
  return request.get('org/project')
}

// 添加项目成员
export function addProjectMember(projectId: number, data: AddMemberRequest): Promise<Result<void>> {
  return request.post(`org/project/${projectId}/members`, data)
}

// 获取项目成员列表
export function getProjectMembers(projectId: number, silent = false): Promise<Result<ProjectMemberResponse[]>> {
  return request.get(`org/project/${projectId}/members`, { silent })
}

export function getProject(id: number): Promise<Result<Project>> {
  return request.get(`org/project/${id}`)
}

export function updateProject(id: number, data: ProjectUpdateRequest): Promise<Result<Project>> {
  return request.patch(`org/project/${id}`, data)
}

export function deleteProject(id: number): Promise<Result<void>> {
  return request.delete(`org/project/${id}`)
}

// 根据项目ID获取评估记录
export function getAssessmentByProjectId(projectId: number, silent = false): Promise<Result<Assessment | null>> {
  return request.get(`org/project/${projectId}/assessment`, { silent })
}

