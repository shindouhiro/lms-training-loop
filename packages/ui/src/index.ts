import type { ThemeConfig } from 'antd'

export const lmsTheme: ThemeConfig = {
  token: {
    colorPrimary: '#2563eb',
    colorSuccess: '#16a34a',
    colorWarning: '#d97706',
    colorError: '#dc2626',
    colorInfo: '#0891b2',
    borderRadius: 8,
    fontFamily: 'Inter, Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  components: {
    Button: {
      controlHeight: 36,
    },
    Card: {
      borderRadiusLG: 8,
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
} as const
