# 企业合规风险预警前端

Vue 3 + TypeScript + Element Plus，前端与后端仓库放在同级目录。

## 本地运行

```sh
npm ci
npm run dev
```

默认访问 `http://localhost:3000`。Vite 将 `/api` 转发到本机网关 `http://localhost:8088`，将 `/ws` 转发到通知服务 `ws://127.0.0.1:9090`，配置位于现有 `vite.config.ts`。

```sh
npm run build
npm run preview
```

`build` 同时执行 Vue/TypeScript 类型检查和生产打包。构建工具已统一到支持当前配置的 TypeScript 5.9 与 vue-tsc 3；依赖锁定在 `package-lock.json`。

## 评估结果接入

- 企业管理页可输入完整企业名查询，或点击列表中的“最新评估”。名称会做 URL 编码，统一报告直接读取 `data.overallResult`，不再解析原始 `details` 字符串。
- 项目详情的评估记录仍使用 `data.id`；企业统一报告使用 `data.assessmentId`。
- 评估状态为 `TO_BE_ASSESSED`、`ASSESSING`、`ASSESSED`、`FAILED`。只有已完成评估才显示评分、指标与风险清单。
- 失败页展示 `failureReason`、`failureCode`、`failureStage`、`failedAt` 及评估/项目 ID。重新评估需回项目页上传材料；“刷新状态”仅查询结果。
- 查询报错单独显示提示，不会把网络或服务异常当作业务评估失败，也不会用空统计冒充已完成报告。

使用的现有后端接口：

| 用途 | 网关地址 |
| --- | --- |
| 企业最新统一报告 | `GET /api/org/enterprise/{name}/assessment` |
| 项目最新原始评估记录 | `GET /api/org/project/{projectId}/assessment` |
| 评估状态与失败摘要 | `GET /api/assessment/{assessmentId}/status` |
| 总览报告 | `GET /api/report/report/report/general/{assessmentId}` |
| 指标分布 | `GET /api/report/report/report/indicatorResult/{assessmentId}` |
| 风险清单 | `GET /api/report/report/report/risk?assessmentId=...` |

## 等待与通知

结果页每 5 秒查询未结束的任务，同一时刻只执行一次状态检查。成功或失败后停止轮询，离开页面时移除计时器和通知监听；刷新页面、网络恢复或 WebSocket 重连后可继续查询。

确认上传前会保存该项目上一条评估的 ID，等待页只接受更大的新 ID，避免异步任务尚未创建时显示旧报告。该边界通过 `afterAssessmentId` 保存在 URL 中，刷新后仍有效。

WebSocket 的 `ASSESSMENT_FAILED` 通知已接入，`extraData` 支持后端发送的 JSON 字符串；无效 JSON 会忽略并通过查询补全。结果页会按评估 ID 筛选通知，防止其他项目或历史评估覆盖当前页面。未停留在结果页时，失败通知可以点击查看详情。

## 验证

已验证生产构建，以及浏览器中的成功报告、失败追溯、状态轮询、通知 ID 筛选、上传旧记录隔离、中文企业名查询、无记录和查询失败重试场景。浏览器验证使用模拟 API/WebSocket；真实部署仍需启动已更新的网关、org、processing、report、notification 等后端服务联调。
