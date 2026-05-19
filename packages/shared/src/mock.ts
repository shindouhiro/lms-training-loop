import type { LmsData } from './types'

export function createInitialData(): LmsData {
  return {
    organizations: [
      { id: 1, name: '新零售总部', code: 'HQ', type: 'factory' },
      { id: 2, name: '华东旗舰店', code: 'STORE-HD-01', type: 'store', parentId: 1 },
    ],
    employees: [
      { id: 1, name: '林主管', employeeNo: 'A0001', phone: '13800000001', organizationId: 1, status: 'active' },
      { id: 2, name: '陈学员', employeeNo: 'S0001', phone: '13800000002', organizationId: 2, status: 'active' },
    ],
    users: [
      { id: 1, name: '林主管', employeeId: 1, userType: 'admin', status: 'active' },
      { id: 2, name: '陈学员', employeeId: 2, userType: 'student', status: 'active' },
    ],
    positions: [
      { id: 1, name: '销售-L1', code: 'SALES-L1', positionType: '销售', level: 'L1' },
      { id: 2, name: '客服-L1', code: 'SERVICE-L1', positionType: '客服', level: 'L1' },
    ],
    userPositions: [{ id: 1, userId: 2, positionId: 1, isPrimary: true }],
    coursewareCategories: [
      { id: 1, name: '产品知识', order: 1 },
      { id: 2, name: '服务规范', order: 2 },
    ],
    coursewares: [
      { id: 1, name: '门店迎宾视频', code: 'CW-001', type: 'video', url: '/mock/welcome.mp4', duration: 12, cover: '', isRequired: true, categoryId: 2, status: 'published' },
      { id: 2, name: '新品卖点图文', code: 'CW-002', type: 'article', url: '/mock/product.html', duration: 8, cover: '', isRequired: true, categoryId: 1, status: 'published' },
      { id: 3, name: '陈列标准文档', code: 'CW-003', type: 'document', url: '/mock/display.pdf', duration: 15, cover: '', isRequired: true, categoryId: 2, status: 'draft' },
    ],
    courseCategories: [
      { id: 1, name: '岗位必修', order: 1 },
      { id: 2, name: '产品训练', order: 2 },
    ],
    courses: [
      {
        id: 1,
        name: '销售 L1 入门认证',
        code: 'COURSE-SALES-L1',
        cover: '',
        description: '面向新零售门店销售岗位的基础自学课程。',
        categoryId: 1,
        examId: 1,
        status: 'published',
        createdBy: 1,
        chapters: [
          {
            id: 1,
            courseId: 1,
            name: '服务流程',
            order: 1,
            isExamRequired: false,
            sections: [
              { id: 1, chapterId: 1, name: '门店迎宾标准', order: 1, contentType: 'video', coursewareId: 1 },
              { id: 2, chapterId: 1, name: '顾客需求识别', order: 2, contentType: 'article', coursewareId: 2 },
            ],
          },
        ],
      },
    ],
    questions: [
      { id: 1, content: '迎宾时应优先完成哪项动作？', type: 'single', options: [{ label: '主动问候', value: 'A' }, { label: '直接推销', value: 'B' }], answer: 'A', analysis: '标准服务流程要求先建立友好接触。', difficulty: 'easy', categoryId: 1, status: 'enabled' },
      { id: 2, content: '以下哪些属于需求识别动作？', type: 'multiple', options: [{ label: '开放式提问', value: 'A' }, { label: '复述确认', value: 'B' }, { label: '打断顾客', value: 'C' }], answer: ['A', 'B'], analysis: '提问和复述确认可以帮助识别真实需求。', difficulty: 'medium', categoryId: 1, status: 'enabled' },
      { id: 3, content: '完成课程后才可以参加课程考试。', type: 'judge', options: [{ label: '正确', value: 'true' }, { label: '错误', value: 'false' }], answer: true, analysis: '课程完成是考试资格前置条件。', difficulty: 'easy', categoryId: 1, status: 'enabled' },
    ],
    paperQuestions: [
      { id: 1, paperId: 1, questionId: 1, score: 30, sortOrder: 1 },
      { id: 2, paperId: 1, questionId: 2, score: 40, sortOrder: 2 },
      { id: 3, paperId: 1, questionId: 3, score: 30, sortOrder: 3 },
    ],
    papers: [{ id: 1, name: '销售 L1 入门试卷', totalScore: 100, questionCount: 3, questionIds: [1, 2, 3], status: 'published' }],
    exams: [{ id: 1, name: '销售 L1 入门认证考试', paperId: 1, passScore: 60, duration: 45, limitCount: 3, status: 'published' }],
    examRecords: [{ id: 1, examId: 1, userId: 2, score: null, status: 'pending', attemptNumber: 0 }],
    learningRecords: [
      { id: 1, userId: 2, courseId: 1, chapterId: 1, sectionId: 1, progress: 100, status: 'completed', lastLearnTime: '2026-05-19T09:30:00+08:00' },
    ],
    tasks: [{ id: 1, name: '销售 L1 认证学习任务', courseId: 1, startTime: '2026-05-18T09:00:00+08:00', endTime: '2026-06-18T18:00:00+08:00', status: 'active', createdBy: 1 }],
    notifications: [
      { id: 1, userId: 2, type: 'course_task', title: '新的课程任务', content: '请完成销售 L1 入门认证。', isRead: false, sendTime: '2026-05-18T09:00:00+08:00' },
      { id: 2, userId: 2, type: 'exam_task', title: '考试提醒', content: '您的销售 L1 入门认证考试已开放，请在截止日期前完成。', isRead: true, sendTime: '2026-05-19T08:00:00+08:00' },
    ],
    coursePositionBindings: [{ id: 1, courseId: 1, positionId: 1 }],
    taskAssignments: [{ id: 1, taskId: 1, userId: 2 }],
  }
}
