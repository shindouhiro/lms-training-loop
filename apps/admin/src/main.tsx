import type { ProColumns } from '@ant-design/pro-components'
import type { Course, Courseware, Exam, Organization, Position, Question, Task, User } from '@lms/shared'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { ModalForm, PageContainer, ProDescriptions, ProFormDateTimePicker, ProFormDigit, ProFormSelect, ProFormText, ProLayout, ProTable } from '@ant-design/pro-components'
import { createInitialData, getTaskStatus } from '@lms/shared'
import { lmsTheme, statusText } from '@lms/ui'
import { App, Button, Card, ConfigProvider, Space, Statistic, Tabs, Tag, Tree, Upload } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

type PageKey = 'dashboard' | 'coursewares' | 'coursewareCategories' | 'courseCategories' | 'courses' | 'courseDetail' | 'bindings' | 'questions' | 'papers' | 'exams' | 'tasks' | 'organizations' | 'positions' | 'users'

const initialData = createInitialData()

const routes = {
  path: '/',
  routes: [
    { path: '/dashboard', name: '概览' },
    {
      path: '/courseware',
      name: '课件管理',
      routes: [
        { path: '/courseware/list', name: '课件列表' },
        { path: '/courseware/categories', name: '课件分类' },
      ],
    },
    {
      path: '/course',
      name: '课程管理',
      routes: [
        { path: '/course/categories', name: '课程分类' },
        { path: '/course/list', name: '课程列表' },
        { path: '/course/detail', name: '课程详情' },
        { path: '/course/bindings', name: '岗位课程绑定' },
      ],
    },
    {
      path: '/exam',
      name: '考试管理',
      routes: [
        { path: '/exam/questions', name: '试题管理' },
        { path: '/exam/papers', name: '试卷管理' },
        { path: '/exam/list', name: '考试管理' },
      ],
    },
    { path: '/tasks', name: '任务管理' },
    {
      path: '/base',
      name: '基础管理',
      routes: [
        { path: '/base/organizations', name: '组织架构' },
        { path: '/base/positions', name: '岗位管理' },
      ],
    },
    { path: '/users', name: '系统管理' },
  ],
}

const pathToPage: Record<string, PageKey> = {
  '/dashboard': 'dashboard',
  '/courseware/list': 'coursewares',
  '/courseware/categories': 'coursewareCategories',
  '/course/categories': 'courseCategories',
  '/course/list': 'courses',
  '/course/detail': 'courseDetail',
  '/course/bindings': 'bindings',
  '/exam/questions': 'questions',
  '/exam/papers': 'papers',
  '/exam/list': 'exams',
  '/tasks': 'tasks',
  '/base/organizations': 'organizations',
  '/base/positions': 'positions',
  '/users': 'users',
}

function publishTag(status: string): React.ReactNode {
  const color = status === 'published' ? 'green' : status === 'draft' ? 'gold' : 'default'
  return <Tag color={color}>{statusText[status as keyof typeof statusText] ?? status}</Tag>
}

function AdminApp(): React.ReactElement {
  const { message } = App.useApp()
  const [pathname, setPathname] = useState('/dashboard')
  const [data, setData] = useState(initialData)
  const page = pathToPage[pathname] ?? 'dashboard'

  const activeCourses = data.courses.filter(course => course.status === 'published').length
  const activeTasks = data.tasks.filter(task => getTaskStatus(new Date(), task) === 'active').length

  const resetData = (): void => {
    setData(createInitialData())
    message.success('已重置 mock 数据')
  }

  const publishCourse = (id: number): void => {
    setData(current => ({
      ...current,
      courses: current.courses.map(course => course.id === id ? { ...course, status: 'published' } : course),
    }))
  }

  const addCourseware = (values: Partial<Courseware>): void => {
    setData(current => ({
      ...current,
      coursewares: [
        ...current.coursewares,
        {
          id: Date.now(),
          name: values.name ?? '未命名课件',
          code: values.code ?? `CW-${Date.now()}`,
          type: values.type ?? 'video',
          url: values.url ?? '/mock/new',
          duration: values.duration ?? 10,
          cover: '',
          isRequired: true,
          categoryId: values.categoryId ?? 1,
          status: 'draft',
        },
      ],
    }))
    message.success('课件已创建')
  }

  const addCourse = (values: Partial<Course>): void => {
    setData(current => ({
      ...current,
      courses: [
        ...current.courses,
        {
          id: Date.now(),
          name: values.name ?? '未命名课程',
          code: values.code ?? `COURSE-${Date.now()}`,
          cover: '',
          description: values.description ?? '待完善课程描述',
          categoryId: values.categoryId ?? 1,
          examId: values.examId ?? 1,
          status: 'draft',
          createdBy: 1,
          chapters: [],
        },
      ],
    }))
    message.success('课程已创建')
  }

  const addTask = (values: Partial<Task>): void => {
    setData(current => ({
      ...current,
      tasks: [
        ...current.tasks,
        {
          id: Date.now(),
          name: values.name ?? '未命名任务',
          courseId: values.courseId ?? 1,
          startTime: String(values.startTime),
          endTime: String(values.endTime),
          status: 'not_started',
          createdBy: 1,
        },
      ],
    }))
    message.success('任务已创建')
  }

  return (
    <ProLayout
      title="LMS 培训系统"
      logo={false}
      route={routes}
      location={{ pathname }}
      menuItemRender={(item, dom) => (
        <button id={`admin-nav-${item.path?.replaceAll('/', '-')}`} className="nav-button" onClick={() => item.path && setPathname(item.path)}>
          {dom}
        </button>
      )}
      actionsRender={() => [
        <Button id="admin-reset-data-button" key="reset" icon={<ReloadOutlined />} onClick={resetData}>
          重置数据
        </Button>,
      ]}
    >
      <PageContainer title={pageTitle(page)}>
        {page === 'dashboard' && <Dashboard activeCourses={activeCourses} activeTasks={activeTasks} data={data} />}
        {page === 'coursewares' && <CoursewareTable coursewares={data.coursewares} onAdd={addCourseware} />}
        {page === 'coursewareCategories' && <CategoryTree title="课件分类" items={data.coursewareCategories} />}
        {page === 'courseCategories' && <CategoryTree title="课程分类" items={data.courseCategories} />}
        {page === 'courses' && <CourseTable courses={data.courses} exams={data.exams} onAdd={addCourse} onPublish={publishCourse} />}
        {page === 'courseDetail' && <CourseDetail course={data.courses[0]!} />}
        {page === 'bindings' && <BindingTable data={data} />}
        {page === 'questions' && <QuestionTable questions={data.questions} />}
        {page === 'papers' && <SimpleTable title="试卷列表" dataSource={data.papers} />}
        {page === 'exams' && <ExamTable exams={data.exams} />}
        {page === 'tasks' && <TaskTable tasks={data.tasks} courses={data.courses} onAdd={addTask} />}
        {page === 'organizations' && <SimpleTable<Organization> title="组织架构" dataSource={data.organizations} />}
        {page === 'positions' && <SimpleTable<Position> title="岗位管理" dataSource={data.positions} />}
        {page === 'users' && <SimpleTable<User> title="用户管理" dataSource={data.users} />}
      </PageContainer>
    </ProLayout>
  )
}

function pageTitle(page: PageKey): string {
  const titles: Record<PageKey, string> = {
    dashboard: '运营概览',
    coursewares: '课件列表',
    coursewareCategories: '课件分类',
    courseCategories: '课程分类',
    courses: '课程列表',
    courseDetail: '课程详情',
    bindings: '岗位课程绑定',
    questions: '试题管理',
    papers: '试卷管理',
    exams: '考试管理',
    tasks: '任务管理',
    organizations: '组织架构管理',
    positions: '岗位管理',
    users: '用户管理',
  }
  return titles[page]
}

function Dashboard({ activeCourses, activeTasks, data }: { activeCourses: number, activeTasks: number, data: typeof initialData }): React.ReactElement {
  return (
    <Space direction="vertical" size={16} className="full-width">
      <div className="stats-grid">
        <Card><Statistic title="已发布课程" value={activeCourses} suffix={`/ ${data.courses.length}`} /></Card>
        <Card><Statistic title="进行中任务" value={activeTasks} suffix={`/ ${data.tasks.length}`} /></Card>
        <Card><Statistic title="题库题目" value={data.questions.length} /></Card>
        <Card><Statistic title="学员用户" value={data.users.filter(user => user.userType === 'student').length} /></Card>
      </div>
      <Card title="培训闭环">
        <Tabs
          items={[
            { key: 'flow', label: '业务流', children: '课件上传 -> 课程编排 -> 关联考试 -> 岗位绑定 -> 创建任务 -> 学员学习 -> 自动评分。' },
            { key: 'risk', label: '待关注', children: '当前为本地 mock 闭环，刷新页面会回到初始数据；后续可替换为真实 API adapter。' },
          ]}
        />
      </Card>
    </Space>
  )
}

function CoursewareTable({ coursewares, onAdd }: { coursewares: Courseware[], onAdd: (values: Partial<Courseware>) => void }): React.ReactElement {
  const finishCreate = async (values: Partial<Courseware>): Promise<boolean> => {
    onAdd(values)
    return true
  }

  const columns: ProColumns<Courseware>[] = [
    { title: '课件名称', dataIndex: 'name' },
    { title: '编码', dataIndex: 'code' },
    { title: '类型', dataIndex: 'type', valueEnum: { 'video': '视频', 'article': '图文', 'document': '文档', '3d': '3D' } },
    { title: '时长', dataIndex: 'duration', renderText: value => `${value} 分钟` },
    { title: '状态', dataIndex: 'status', render: (_, record) => publishTag(record.status) },
  ]
  return (
    <ProTable<Courseware>
      rowKey="id"
      search={false}
      columns={columns}
      dataSource={coursewares}
      toolBarRender={() => [
        <ModalForm key="add" title="上传课件" trigger={<Button id="admin-courseware-create-button" type="primary" icon={<PlusOutlined />}>上传课件</Button>} onFinish={finishCreate}>
          <ProFormText name="name" label="课件名称" rules={[{ required: true }]} />
          <ProFormText name="code" label="课件编码" rules={[{ required: true }]} />
          <ProFormSelect name="type" label="课件类型" initialValue="video" options={[{ label: '视频', value: 'video' }, { label: '图文', value: 'article' }, { label: '文档', value: 'document' }, { label: '3D', value: '3d' }]} />
          <ProFormDigit name="duration" label="学习时长（分钟）" initialValue={10} />
          <Upload.Dragger id="admin-courseware-upload" beforeUpload={() => false}>拖拽或点击上传课件文件</Upload.Dragger>
        </ModalForm>,
      ]}
    />
  )
}

function CategoryTree({ title, items }: { title: string, items: Array<{ id: number, name: string, parentId?: number }> }): React.ReactElement {
  const treeData = items.map(item => ({ key: item.id, title: item.name }))
  return <Card title={title}><div id={`admin-${title}-tree`}><Tree defaultExpandAll treeData={treeData} /></div></Card>
}

function CourseTable({ courses, exams, onAdd, onPublish }: { courses: Course[], exams: Exam[], onAdd: (values: Partial<Course>) => void, onPublish: (id: number) => void }): React.ReactElement {
  const finishCreate = async (values: Partial<Course>): Promise<boolean> => {
    onAdd(values)
    return true
  }

  const columns: ProColumns<Course>[] = [
    { title: '课程名称', dataIndex: 'name' },
    { title: '编码', dataIndex: 'code' },
    { title: '关联考试', dataIndex: 'examId', renderText: value => exams.find(exam => exam.id === value)?.name ?? '-' },
    { title: '章节数', renderText: (_, record) => record.chapters.length },
    { title: '状态', dataIndex: 'status', render: (_, record) => publishTag(record.status) },
    { title: '操作', valueType: 'option', render: (_, record) => [<Button id={`admin-course-publish-${record.id}`} key="publish" type="link" disabled={record.status === 'published'} onClick={() => onPublish(record.id)}>发布</Button>] },
  ]
  return (
    <ProTable<Course>
      rowKey="id"
      search={false}
      columns={columns}
      dataSource={courses}
      toolBarRender={() => [
        <ModalForm key="add" title="创建课程" trigger={<Button id="admin-course-create-button" type="primary" icon={<PlusOutlined />}>创建课程</Button>} onFinish={finishCreate}>
          <ProFormText name="name" label="课程名称" rules={[{ required: true }]} />
          <ProFormText name="code" label="课程编码" rules={[{ required: true }]} />
          <ProFormText name="description" label="课程描述" />
          <ProFormSelect name="examId" label="关联考试" initialValue={1} options={exams.map(exam => ({ label: exam.name, value: exam.id }))} />
        </ModalForm>,
      ]}
    />
  )
}

function CourseDetail({ course }: { course: Course }): React.ReactElement {
  return (
    <Space direction="vertical" className="full-width" size={16}>
      <ProDescriptions title={course.name} dataSource={course} columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'description' }, { title: '状态', dataIndex: 'status', render: (_, record) => publishTag(record.status) }]} />
      <Card title="章节与小节">
        <Tabs items={course.chapters.map(chapter => ({
          key: String(chapter.id),
          label: chapter.name,
          children: <ProTable rowKey="id" search={false} pagination={false} dataSource={chapter.sections} columns={[{ title: '小节', dataIndex: 'name' }, { title: '内容类型', dataIndex: 'contentType' }, { title: '排序', dataIndex: 'order' }]} />,
        }))}
        />
      </Card>
    </Space>
  )
}

function BindingTable({ data }: { data: typeof initialData }): React.ReactElement {
  const rows = data.coursePositionBindings.map(binding => ({
    ...binding,
    courseName: data.courses.find(course => course.id === binding.courseId)?.name,
    positionName: data.positions.find(position => position.id === binding.positionId)?.name,
  }))
  return <ProTable rowKey="id" search={false} dataSource={rows} columns={[{ title: '课程', dataIndex: 'courseName' }, { title: '岗位等级', dataIndex: 'positionName' }]} />
}

function QuestionTable({ questions }: { questions: Question[] }): React.ReactElement {
  return <ProTable<Question> rowKey="id" search={false} dataSource={questions} columns={[{ title: '题目', dataIndex: 'content' }, { title: '题型', dataIndex: 'type' }, { title: '难度', dataIndex: 'difficulty' }, { title: '状态', dataIndex: 'status', render: (_, record) => <Tag color={record.status === 'enabled' ? 'green' : 'default'}>{record.status === 'enabled' ? '启用' : '禁用'}</Tag> }]} />
}

function ExamTable({ exams }: { exams: Exam[] }): React.ReactElement {
  return <ProTable<Exam> rowKey="id" search={false} dataSource={exams} columns={[{ title: '考试名称', dataIndex: 'name' }, { title: '合格分', dataIndex: 'passScore' }, { title: '时长', dataIndex: 'duration', renderText: value => `${value} 分钟` }, { title: '限考次数', dataIndex: 'limitCount' }, { title: '状态', dataIndex: 'status', render: (_, record) => publishTag(record.status) }]} />
}

function TaskTable({ tasks, courses, onAdd }: { tasks: Task[], courses: Course[], onAdd: (values: Partial<Task>) => void }): React.ReactElement {
  const finishCreate = async (values: Partial<Task>): Promise<boolean> => {
    onAdd(values)
    return true
  }

  const rows = useMemo(() => tasks.map(task => ({ ...task, computedStatus: getTaskStatus(new Date(), task), courseName: courses.find(course => course.id === task.courseId)?.name })), [courses, tasks])
  return (
    <ProTable
      rowKey="id"
      search={false}
      dataSource={rows}
      columns={[{ title: '任务名称', dataIndex: 'name' }, { title: '课程', dataIndex: 'courseName' }, { title: '开始时间', dataIndex: 'startTime' }, { title: '截止时间', dataIndex: 'endTime' }, { title: '状态', dataIndex: 'computedStatus', render: (_, record) => <Tag>{statusText[record.computedStatus as keyof typeof statusText]}</Tag> }]}
      toolBarRender={() => [
        <ModalForm key="add" title="创建任务" trigger={<Button id="admin-task-create-button" type="primary" icon={<PlusOutlined />}>创建任务</Button>} onFinish={finishCreate}>
          <ProFormText name="name" label="任务名称" rules={[{ required: true }]} />
          <ProFormSelect name="courseId" label="关联课程" initialValue={1} options={courses.map(course => ({ label: course.name, value: course.id }))} />
          <ProFormDateTimePicker name="startTime" label="开始时间" rules={[{ required: true }]} />
          <ProFormDateTimePicker name="endTime" label="截止时间" rules={[{ required: true }]} />
        </ModalForm>,
      ]}
    />
  )
}

function SimpleTable<T extends { id: number, name?: string, code?: string }>({ title, dataSource }: { title: string, dataSource: T[] }): React.ReactElement {
  return <ProTable<T> headerTitle={title} rowKey="id" search={false} dataSource={dataSource} columns={[{ title: '名称', dataIndex: 'name' }, { title: '编码', dataIndex: 'code' }]} />
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={lmsTheme}>
      <App>
        <AdminApp />
      </App>
    </ConfigProvider>
  </React.StrictMode>,
)
