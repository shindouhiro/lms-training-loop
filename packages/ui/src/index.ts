import type { ThemeConfig } from 'antd'

export const lmsTheme: ThemeConfig = {
  token: {
    colorPrimary: '#5C6BFF', // 豆包蓝
    colorSuccess: '#00D0CC', // 豆包青
    colorWarning: '#F5A623',
    colorError: '#FF4D4F',
    colorInfo: '#9D4EDD', // 共生紫
    colorBgLayout: '#f4f6f8', // 银白色基础背景
    colorBgContainer: '#ffffff',
    colorBorderSecondary: '#f0f0f0',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
    boxShadowSecondary: '0 8px 30px rgba(0, 0, 0, 0.08)',
    borderRadius: 10,
    controlHeight: 40,
    fontFamily: 'Inter, Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  components: {
    Button: {
      borderRadius: 8,
      fontWeight: 500,
    },
    Card: {
      borderRadiusLG: 16,
      boxShadowTertiary: '0 4px 20px rgba(0, 0, 0, 0.02)',
    },
  },
}

export const statusText = {
  draft: '草稿',
  published: '已发布',
  archived: '已下架',
  not_started: '未开始',
  active: '进行中',
  ended: '已结束',
  closed: '已关闭',
  pending: '待考试',
  submitted: '已参加',
  passed: '已通过',
  failed: '未通过',
  learning: '学习中',
  completed: '已完成',
  enabled: '启用',
  disabled: '禁用',
} as const
