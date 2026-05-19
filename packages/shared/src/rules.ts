import type { Course, Exam, ExamRecord, ID, LearningRecord, Position, Question, Task, TaskStatus, User, UserPosition } from './types'

export interface GradeResult {
  score: number
  correctCount: number
  totalCount: number
}

export function getTaskStatus(now: Date, task: Task): TaskStatus {
  if (task.status === 'closed')
    return 'closed'

  const start = new Date(task.startTime)
  const end = new Date(task.endTime)

  if (now < start)
    return 'not_started'
  if (now > end)
    return 'ended'
  return 'active'
}

export function getCourseSections(course: Course): Array<{ chapterId: ID, sectionId: ID }> {
  return course.chapters
    .sort((a, b) => a.order - b.order)
    .flatMap(chapter =>
      chapter.sections
        .sort((a, b) => a.order - b.order)
        .map(section => ({ chapterId: chapter.id, sectionId: section.id })),
    )
}

export function getCourseProgress(course: Course, learningRecords: LearningRecord[], userId?: ID): number {
  const sections = getCourseSections(course)
  if (sections.length === 0)
    return 0

  const completed = sections.filter(section =>
    learningRecords.some(record =>
      record.courseId === course.id
      && record.sectionId === section.sectionId
      && record.status === 'completed'
      && (userId === undefined || record.userId === userId),
    ),
  ).length

  return Math.round((completed / sections.length) * 100)
}

export function canAccessSection(course: Course, sectionId: ID, learningRecords: LearningRecord[], userId?: ID): boolean {
  const sections = getCourseSections(course)
  const targetIndex = sections.findIndex(section => section.sectionId === sectionId)
  if (targetIndex <= 0)
    return targetIndex === 0

  const previousSections = sections.slice(0, targetIndex)
  return previousSections.every(section =>
    learningRecords.some(record =>
      record.courseId === course.id
      && record.sectionId === section.sectionId
      && record.status === 'completed'
      && (userId === undefined || record.userId === userId),
    ),
  )
}

export function canTakeExam(course: Course, exam: Exam, learningRecords: LearningRecord[], examRecords: ExamRecord[], userId: ID): boolean {
  const courseCompleted = getCourseProgress(course, learningRecords, userId) === 100
  const attempts = examRecords
    .filter(record => record.examId === exam.id && record.userId === userId)
    .reduce((max, record) => Math.max(max, record.attemptNumber), 0)

  return courseCompleted && exam.status === 'published' && attempts < exam.limitCount
}

function normalizeAnswer(value: Question['answer'] | string | string[] | boolean): string {
  if (Array.isArray(value))
    return [...value].sort().join(',')
  return String(value)
}

export function gradeExam(questions: Question[], answers: Record<ID, string | string[] | boolean>): GradeResult {
  const totalCount = questions.length
  if (totalCount === 0)
    return { score: 0, correctCount: 0, totalCount: 0 }

  const correctCount = questions.filter(question =>
    normalizeAnswer(question.answer) === normalizeAnswer(answers[question.id] ?? ''),
  ).length

  return {
    score: Math.round((correctCount / totalCount) * 100),
    correctCount,
    totalCount,
  }
}

export function getVisibleTasksForUser(
  user: User,
  userPositions: UserPosition[],
  positions: Position[],
  courseBindings: Array<{ courseId: ID, positionId: ID }>,
  tasks: Task[],
): Task[] {
  const positionIds = userPositions
    .filter(position => position.userId === user.id)
    .map(position => position.positionId)

  const positionSet = new Set(positions.filter(position => positionIds.includes(position.id)).map(position => position.id))
  const visibleCourseIds = new Set(courseBindings
    .filter(binding => positionSet.has(binding.positionId))
    .map(binding => binding.courseId))

  return tasks.filter(task => visibleCourseIds.has(task.courseId))
}
