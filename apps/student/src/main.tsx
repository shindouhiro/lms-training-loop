import type { Course, ID, LearningRecord, Question } from '@lms/shared'
import { BookOutlined, CheckCircleOutlined, FileDoneOutlined, UserOutlined } from '@ant-design/icons'
import { canAccessSection, canTakeExam, createInitialData, getCourseProgress, getVisibleTasksForUser, gradeExam } from '@lms/shared'
import { lmsTheme, statusText } from '@lms/ui'
import { App, Avatar, Button, Card, Checkbox, ConfigProvider, Descriptions, Empty, Layout, List, Progress, Radio, Result, Space, Statistic, Steps, Tabs, Tag, Typography } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

type View = 'tasks' | 'courses' | 'exams' | 'profile'

const initialData = createInitialData()
const currentUserId = 2

function StudentApp(): React.ReactElement {
  const { message } = App.useApp()
  const [view, setView] = useState<View>('tasks')
  const [data, setData] = useState(initialData)
  const [selectedCourseId, setSelectedCourseId] = useState<ID>(1)
  const [answers, setAnswers] = useState<Record<ID, string | string[] | boolean>>({})
  const currentUser = data.users.find(user => user.id === currentUserId)!
  const selectedCourse = data.courses.find(course => course.id === selectedCourseId) ?? data.courses[0]!
  const exam = data.exams.find(item => item.id === selectedCourse.examId)!
  const paper = data.papers.find(item => item.id === exam.paperId)!
  const questions = paper.questionIds.map(id => data.questions.find(question => question.id === id)!).filter(Boolean)

  const visibleTasks = getVisibleTasksForUser(currentUser, data.userPositions, data.positions, data.coursePositionBindings, data.tasks)
  const visibleCourses = visibleTasks
    .map(task => data.courses.find(course => course.id === task.courseId))
    .filter((course): course is Course => Boolean(course))

  const canExam = canTakeExam(selectedCourse, exam, data.learningRecords, data.examRecords, currentUserId)

  const completeSection = (course: Course, sectionId: ID): void => {
    const chapter = course.chapters.find(item => item.sections.some(section => section.id === sectionId))
    if (!chapter)
      return

    if (!canAccessSection(course, sectionId, data.learningRecords, currentUserId)) {
      message.warning('请先完成前置小节')
      return
    }

    setData((current) => {
      const exists = current.learningRecords.some(record => record.userId === currentUserId && record.sectionId === sectionId)
      const nextRecord: LearningRecord = {
        id: Date.now(),
        userId: currentUserId,
        courseId: course.id,
        chapterId: chapter.id,
        sectionId,
        progress: 100,
        status: 'completed',
        lastLearnTime: new Date().toISOString(),
      }

      return {
        ...current,
        learningRecords: exists
          ? current.learningRecords.map(record => record.userId === currentUserId && record.sectionId === sectionId ? nextRecord : record)
          : [...current.learningRecords, nextRecord],
      }
    })
    message.success('小节已完成，学习进度已更新')
  }

  const submitExam = (): void => {
    if (!canExam) {
      message.warning('完成课程后才能参加考试')
      return
    }

    const result = gradeExam(questions, answers)
    setData(current => ({
      ...current,
      examRecords: [
        ...current.examRecords,
        {
          id: Date.now(),
          examId: exam.id,
          userId: currentUserId,
          score: result.score,
          status: result.score >= exam.passScore ? 'passed' : 'failed',
          examTime: new Date().toISOString(),
          attemptNumber: current.examRecords.filter(record => record.userId === currentUserId && record.examId === exam.id).length + 1,
        },
      ],
    }))
    message.success(`已交卷，得分 ${result.score}`)
  }

  const openCourse = (courseId: ID): void => {
    setSelectedCourseId(courseId)
    setView('courses')
  }

  return (
    <Layout className="student-shell">
      <Layout.Header className="student-header">
        <Typography.Title level={1}>LMS 学员端</Typography.Title>
        <Space>
          <Avatar icon={<UserOutlined />} />
          <span>{currentUser.name}</span>
        </Space>
      </Layout.Header>
      <Layout className="student-body">
        <Layout.Sider width={220} breakpoint="lg" collapsedWidth={0} className="student-sider">
          <nav className="student-nav">
            <Button id="student-nav-tasks" type={view === 'tasks' ? 'primary' : 'text'} icon={<FileDoneOutlined />} onClick={() => setView('tasks')}>我的任务</Button>
            <Button id="student-nav-courses" type={view === 'courses' ? 'primary' : 'text'} icon={<BookOutlined />} onClick={() => setView('courses')}>课程学习</Button>
            <Button id="student-nav-exams" type={view === 'exams' ? 'primary' : 'text'} icon={<CheckCircleOutlined />} onClick={() => setView('exams')}>我的考试</Button>
            <Button id="student-nav-profile" type={view === 'profile' ? 'primary' : 'text'} icon={<UserOutlined />} onClick={() => setView('profile')}>个人中心</Button>
          </nav>
        </Layout.Sider>
        <Layout.Content className="student-content">
          {view === 'tasks' && <TaskView tasks={visibleTasks} courses={data.courses} onOpenCourse={openCourse} />}
          {view === 'courses' && <CourseView courses={visibleCourses} selectedCourse={selectedCourse} learningRecords={data.learningRecords} onSelectCourse={setSelectedCourseId} onCompleteSection={completeSection} />}
          {view === 'exams' && <ExamView canExam={canExam} examName={exam.name} passScore={exam.passScore} questions={questions} answers={answers} onAnswer={setAnswers} onSubmit={submitExam} latestScore={data.examRecords.filter(record => record.userId === currentUserId && record.examId === exam.id && record.score !== null).at(-1)?.score ?? null} />}
          {view === 'profile' && <ProfileView data={data} />}
        </Layout.Content>
      </Layout>
    </Layout>
  )
}

function TaskView({ tasks, courses, onOpenCourse }: { tasks: typeof initialData.tasks, courses: Course[], onOpenCourse: (courseId: ID) => void }): React.ReactElement {
  return (
    <Space direction="vertical" size={16} className="full-width">
      <div className="student-stats">
        <Card><Statistic title="待办任务" value={tasks.length} /></Card>
        <Card><Statistic title="学习课程" value={courses.length} /></Card>
      </div>
      <Card title="我的任务">
        <List
          locale={{ emptyText: <Empty description="暂无任务" /> }}
          dataSource={tasks}
          renderItem={(task) => {
            const course = courses.find(item => item.id === task.courseId)
            return (
              <List.Item actions={[<Button id={`student-task-open-${task.id}`} type="primary" onClick={() => onOpenCourse(task.courseId)}>进入学习</Button>]}>
                <List.Item.Meta title={task.name} description={`${course?.name ?? '-'} · ${task.startTime} 至 ${task.endTime}`} />
                <Tag color="blue">{statusText[task.status]}</Tag>
              </List.Item>
            )
          }}
        />
      </Card>
    </Space>
  )
}

function CourseView({ courses, selectedCourse, learningRecords, onSelectCourse, onCompleteSection }: { courses: Course[], selectedCourse: Course, learningRecords: LearningRecord[], onSelectCourse: (id: ID) => void, onCompleteSection: (course: Course, sectionId: ID) => void }): React.ReactElement {
  const progress = getCourseProgress(selectedCourse, learningRecords, currentUserId)
  return (
    <Space direction="vertical" size={16} className="full-width">
      <Card title="课程学习">
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3 }}
          dataSource={courses}
          renderItem={course => (
            <List.Item>
              <Card
                id={`student-course-card-${course.id}`}
                title={course.name}
                actions={[<Button id={`student-course-select-${course.id}`} type={selectedCourse.id === course.id ? 'primary' : 'default'} onClick={() => onSelectCourse(course.id)}>查看课程</Button>]}
              >
                <Typography.Paragraph ellipsis={{ rows: 2 }}>{course.description}</Typography.Paragraph>
                <Progress percent={getCourseProgress(course, learningRecords, currentUserId)} />
              </Card>
            </List.Item>
          )}
        />
      </Card>
      <Card title={selectedCourse.name} extra={<Progress type="circle" percent={progress} size={64} />}>
        <Steps
          direction="vertical"
          items={selectedCourse.chapters.map(chapter => ({
            title: chapter.name,
            description: (
              <List
                dataSource={chapter.sections}
                renderItem={(section) => {
                  const completed = learningRecords.some(record => record.userId === currentUserId && record.sectionId === section.id && record.status === 'completed')
                  const accessible = canAccessSection(selectedCourse, section.id, learningRecords, currentUserId)
                  return (
                    <List.Item actions={[<Button id={`student-section-complete-${section.id}`} disabled={!accessible} onClick={() => onCompleteSection(selectedCourse, section.id)}>{completed ? '已完成' : '完成学习'}</Button>]}>
                      <List.Item.Meta title={section.name} description={accessible ? `内容类型：${section.contentType}` : '请先完成前置小节'} />
                    </List.Item>
                  )
                }}
              />
            ),
          }))}
        />
      </Card>
    </Space>
  )
}

function ExamView({ canExam, examName, passScore, questions, answers, onAnswer, onSubmit, latestScore }: { canExam: boolean, examName: string, passScore: number, questions: Question[], answers: Record<ID, string | string[] | boolean>, onAnswer: (answers: Record<ID, string | string[] | boolean>) => void, onSubmit: () => void, latestScore: number | null }): React.ReactElement {
  return (
    <Card title="我的考试">
      {!canExam && latestScore === null
        ? <Result status="info" title="暂未获得考试资格" subTitle="完成课程全部小节后即可参加课程考试。" />
        : (
            <Space direction="vertical" size={16} className="full-width">
              <Descriptions bordered column={1} items={[{ key: 'exam', label: '考试名称', children: examName }, { key: 'pass', label: '合格分', children: passScore }, { key: 'score', label: '最近成绩', children: latestScore === null ? '未考试' : latestScore }]} />
              <Tabs
                items={[
                  {
                    key: 'answer',
                    label: '考试答题',
                    children: (
                      <Space direction="vertical" size={16} className="full-width">
                        {questions.map(question => (
                          <Card key={question.id} size="small" title={question.content}>
                            {question.type === 'multiple'
                              ? (
                                  <div id={`student-question-${question.id}`}>
                                    <Checkbox.Group options={question.options} value={(answers[question.id] as string[]) ?? []} onChange={value => onAnswer({ ...answers, [question.id]: value as string[] })} />
                                  </div>
                                )
                              : <Radio.Group id={`student-question-${question.id}`} options={question.options} value={String(answers[question.id] ?? '')} onChange={event => onAnswer({ ...answers, [question.id]: question.type === 'judge' ? event.target.value === 'true' : event.target.value })} />}
                          </Card>
                        ))}
                        <Button id="student-exam-submit-button" type="primary" onClick={onSubmit}>提交试卷</Button>
                      </Space>
                    ),
                  },
                ]}
              />
            </Space>
          )}
    </Card>
  )
}

function ProfileView({ data }: { data: typeof initialData }): React.ReactElement {
  const user = data.users.find(item => item.id === currentUserId)!
  const employee = data.employees.find(item => item.id === user.employeeId)!
  const organization = data.organizations.find(item => item.id === employee.organizationId)!
  return (
    <Card title="个人中心">
      <Descriptions
        bordered
        column={{ xs: 1, sm: 1, md: 2 }}
        items={[
          { key: 'name', label: '姓名', children: user.name },
          { key: 'employeeNo', label: '工号', children: employee.employeeNo },
          { key: 'phone', label: '手机号', children: employee.phone },
          { key: 'org', label: '组织', children: organization.name },
        ]}
      />
    </Card>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={lmsTheme}>
      <App>
        <StudentApp />
      </App>
    </ConfigProvider>
  </React.StrictMode>,
)
