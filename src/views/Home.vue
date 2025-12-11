<template>
  <div class="home-container">
    <el-container>
      <el-header class="header">
        <div class="logo">
          <h1>风险合规预警系统</h1>
        </div>
        <div class="nav-menu">
          <el-menu mode="horizontal" :default-active="activeMenu" router>
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/enterprise">企业管理</el-menu-item>
            <el-menu-item index="/project">项目管理</el-menu-item>
          </el-menu>
        </div>
        <div class="user-info">
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              <el-avatar :size="32" :src="userStore.user?.avatarUrl || undefined">
                {{ userStore.user?.fullName?.charAt(0) }}
              </el-avatar>
              <span class="user-name">{{ userStore.user?.fullName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main">
        <div class="welcome-card">
          <h2>欢迎回来，{{ userStore.user?.fullName }}！</h2>
          <p>风险合规预警系统为您提供全方位的企业风险评估与预警服务</p>
        </div>

        <el-row :gutter="20" class="feature-cards">
          <el-col :span="8">
            <el-card class="feature-card" shadow="hover">
              <el-icon class="feature-icon" :size="48"><Document /></el-icon>
              <h3>项目管理</h3>
              <p>创建和管理风险评估项目</p>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="feature-card" shadow="hover">
              <el-icon class="feature-icon" :size="48"><DataAnalysis /></el-icon>
              <h3>风险评估</h3>
              <p>智能分析企业风险指标</p>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="feature-card" shadow="hover">
              <el-icon class="feature-icon" :size="48"><Warning /></el-icon>
              <h3>预警通知</h3>
              <p>实时接收风险预警信息</p>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { ArrowDown, Document, DataAnalysis, Warning } from '@element-plus/icons-vue'

const userStore = useUserStore()
const activeMenu = '/'

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
  } else if (command === 'profile') {
    // 个人中心功能
  }
}
</script>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 0 24px;

  .logo h1 {
    font-size: 20px;
    color: #333;
    margin: 0;
  }

  .nav-menu {
    flex: 1;
    margin-left: 40px;

    :deep(.el-menu) {
      border-bottom: none;
    }
  }

  .user-dropdown {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    .user-name {
      color: #333;
      font-size: 14px;
    }
  }
}

.main {
  padding: 24px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 40px;
  color: #fff;
  margin-bottom: 24px;

  h2 {
    font-size: 28px;
    margin: 0 0 12px;
  }

  p {
    font-size: 16px;
    opacity: 0.9;
    margin: 0;
  }
}

.feature-cards {
  .feature-card {
    text-align: center;
    padding: 20px;
    cursor: pointer;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-4px);
    }

    .feature-icon {
      color: #667eea;
      margin-bottom: 16px;
    }

    h3 {
      font-size: 18px;
      color: #333;
      margin: 0 0 8px;
    }

    p {
      font-size: 14px;
      color: #999;
      margin: 0;
    }
  }
}
</style>
