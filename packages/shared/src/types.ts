export type ID = number

export type OrganizationType = 'factory' | 'store'
export type EmploymentStatus = 'active' | 'inactive'
export type UserType = 'admin' | 'student'
export type PublishStatus = 'draft' | 'published' | 'archived'
export type CoursewareType = 'video' | 'article' | 'document' | '3d'
export type QuestionType = 'single' | 'multiple' | 'judge'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type ExamStatus = 'draft' | 'published' | 'ended'
export type ExamRecordStatus = 'pending' | 'submitted' | 'passed' | 'failed'
export type LearningStatus = 'learning' | 'completed'
export type TaskStatus = 'not_started' | 'active' | 'ended' | 'closed'
export type NotificationType = 'course_task' | 'exam_task'

export interface Organization {
  id: ID
  name: string
  code: string
  type: OrganizationType
  parentId?: ID
}

export interface Employee {
  id: ID
  name: string
  employeeNo: string
  phone: string
  organizationId: ID
  status: EmploymentStatus
}

export interface User {
  id: ID
  name: string
  employeeId: ID
  userType: UserType
  status: EmploymentStatus
}

export interface Position {
  id: ID
  name: string
  code: string
  positionType: string
  level: string
}

export interface UserPosition {
  id: ID
  userId: ID
  positionId: ID
  isPrimary: boolean
}

export interface CoursewareCategory {
  id: ID
  name: string
  parentId?: ID
  order: number
}

export interface Courseware {
  id: ID
  name: string
  code: string
  type: CoursewareType
  url: string
  duration: number
  cover: string
  isRequired: boolean
  categoryId: ID
  status: PublishStatus
}

export interface CourseCategory {
  id: ID
  name: string
  parentId?: ID
  order: number
}

export interface Course {
  id: ID
  name: string
  code: string
  cover: string
  description: string
  categoryId: ID
  examId: ID
  status: PublishStatus
  createdBy: ID
  chapters: Chapter[]
}

export interface Chapter {
  id: ID
  courseId: ID
  name: string
  order: number
  isExamRequired: boolean
  sections: Section[]
}

export interface Section {
  id: ID
  chapterId: ID
  name: string
  order: number
  contentType: CoursewareType
  coursewareId: ID
}

export interface QuestionOption {
  label: string
  value: string
}

export interface Question {
  id: ID
  content: string
  type: QuestionType
  options: QuestionOption[]
  answer: string | string[] | boolean
  analysis: string
  difficulty: Difficulty
  categoryId: ID
  status: 'enabled' | 'disabled'
}

export interface Paper {
  id: ID
  name: string
  totalScore: number
  questionCount: number
  questionIds: ID[]
  status: PublishStatus
}

export interface Exam {
  id: ID
  name: string
  paperId: ID
  passScore: number
  duration: number
  limitCount: number
  status: ExamStatus
}

export interface ExamRecord {
  id: ID
  examId: ID
  userId: ID
  score: number | null
  status: ExamRecordStatus
  examTime?: string
  attemptNumber: number
}

export interface LearningRecord {
  id: ID
  userId: ID
  courseId: ID
  chapterId: ID
  sectionId: ID
  progress: number
  status: LearningStatus
  lastLearnTime: string
}

export interface Task {
  id: ID
  name: string
  courseId: ID
  startTime: string
  endTime: string
  status: TaskStatus
  createdBy: ID
}

export interface Notification {
  id: ID
  userId: ID
  type: NotificationType
  title: string
  content: string
  isRead: boolean
  sendTime: string
}

export interface CoursePositionBinding {
  id: ID
  courseId: ID
  positionId: ID
}

export interface TaskAssignment {
  id: ID
  taskId: ID
  userId: ID
}

export interface LmsData {
  organizations: Organization[]
  employees: Employee[]
  users: User[]
  positions: Position[]
  userPositions: UserPosition[]
  coursewareCategories: CoursewareCategory[]
  coursewares: Courseware[]
  courseCategories: CourseCategory[]
  courses: Course[]
  questions: Question[]
  papers: Paper[]
  exams: Exam[]
  examRecords: ExamRecord[]
  learningRecords: LearningRecord[]
  tasks: Task[]
  notifications: Notification[]
  coursePositionBindings: CoursePositionBinding[]
  taskAssignments: TaskAssignment[]
}
