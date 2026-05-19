import { describe, expect, it } from 'vitest'
import { createInitialData } from './mock'
import { canAccessSection, canTakeExam, getCourseProgress, getTaskStatus, getVisibleTasksForUser, gradeExam } from './rules'

describe('lMS 业务规则', () => {
  const data = createInitialData()
  const course = data.courses[0]!
  const exam = data.exams[0]!
  const user = data.users[1]!

  it('按课程小节顺序解锁学习内容', () => {
    expect(canAccessSection(course, 1, data.learningRecords, user.id)).toBe(true)
    expect(canAccessSection(course, 2, data.learningRecords, user.id)).toBe(true)
    expect(canAccessSection(course, 3, data.learningRecords, user.id)).toBe(false)
  })

  it('计算课程完成进度', () => {
    expect(getCourseProgress(course, data.learningRecords, user.id)).toBe(33)
  })

  it('课程完成后才允许考试且受限考次数约束', () => {
    expect(canTakeExam(course, exam, data.learningRecords, data.examRecords, user.id)).toBe(false)

    const completedRecords = course.chapters.flatMap(chapter => chapter.sections.map(section => ({
      id: section.id + 10,
      userId: user.id,
      courseId: course.id,
      chapterId: chapter.id,
      sectionId: section.id,
      progress: 100,
      status: 'completed' as const,
      lastLearnTime: '2026-05-19T10:00:00+08:00',
    })))

    expect(canTakeExam(course, exam, completedRecords, data.examRecords, user.id)).toBe(true)
  })

  it('支持单选、多选和判断题自动评分', () => {
    const result = gradeExam(data.questions, {
      1: 'A',
      2: ['B', 'A'],
      3: true,
    })

    expect(result).toEqual({ score: 100, correctCount: 3, totalCount: 3 })
  })

  it('按当前时间推导任务状态', () => {
    const task = data.tasks[0]!

    expect(getTaskStatus(new Date('2026-05-01T09:00:00+08:00'), task)).toBe('not_started')
    expect(getTaskStatus(new Date('2026-05-19T09:00:00+08:00'), task)).toBe('active')
    expect(getTaskStatus(new Date('2026-07-01T09:00:00+08:00'), task)).toBe('ended')
  })

  it('通过岗位绑定计算学员可见任务', () => {
    const visibleTasks = getVisibleTasksForUser(user, data.userPositions, data.positions, data.coursePositionBindings, data.tasks)

    expect(visibleTasks.map(task => task.id)).toEqual([1])
  })

  it('§5.3.3 学员仅在任务开始后获取任务', () => {
    // 任务开始前，传入 now 应过滤掉未开始的任务
    const beforeStart = getVisibleTasksForUser(user, data.userPositions, data.positions, data.coursePositionBindings, data.tasks, new Date('2026-05-01T00:00:00+08:00'))
    expect(beforeStart).toEqual([])

    // 任务进行中
    const duringTask = getVisibleTasksForUser(user, data.userPositions, data.positions, data.coursePositionBindings, data.tasks, new Date('2026-05-19T12:00:00+08:00'))
    expect(duringTask.map(task => task.id)).toEqual([1])
  })
})
