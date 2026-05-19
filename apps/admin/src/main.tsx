import type { ProColumns } from '@ant-design/pro-components'
import type { Chapter, Course, CourseCategory, CoursePositionBinding, Courseware, CoursewareCategory, Employee, Exam, Notification, Organization, Paper, Position, Question, Section, Task, TaskAssignment, User } from '@lms/shared'
import { PlusOutlined } from '@ant-design/icons'
import { ModalForm, PageContainer, ProDescriptions, ProFormDateTimePicker, ProFormDigit, ProFormSelect, ProFormText, ProLayout, ProTable } from '@ant-design/pro-components'
import { createInitialData, getTaskStatus } from '@lms/shared'
import { lmsTheme, statusText } from '@lms/ui'
import { App, Button, Card, ConfigProvider, Image, Space, Statistic, Tabs, Tag, Tree, Upload } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

type PageKey = 'dashboard' | 'coursewares' | 'coursewareCategories' | 'courseCategories' | 'courses' | 'courseDetail' | 'bindings' | 'questions' | 'papers' | 'exams' | 'tasks' | 'organizations' | 'positions' | 'employees' | 'users'

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
    {
      path: '/system',
      name: '系统管理',
      routes: [
        { path: '/system/employees', name: '员工管理' },
        { path: '/system/users', name: '用户管理' },
      ],
    },
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
  '/system/employees': 'employees',
  '/system/users': 'users',
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
          cover: values.cover ?? '',
          isRequired: values.isRequired ?? true,
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

  const addChapter = (courseId: number, values: Partial<Chapter>): void => {
    setData(current => ({
      ...current,
      courses: current.courses.map((course) => {
        if (course.id !== courseId)
          return course

        return {
          ...course,
          chapters: [
            ...course.chapters,
            {
              id: Date.now(),
              courseId,
              name: values.name ?? '新章节',
              order: values.order ?? course.chapters.length + 1,
              isExamRequired: values.isExamRequired ?? false,
              sections: [],
            },
          ],
        }
      }),
    }))
    message.success('章节已新增')
  }

  const addSection = (courseId: number, chapterId: number, values: Partial<Section>): void => {
    const courseware = data.coursewares.find(item => item.id === values.coursewareId)

    setData(current => ({
      ...current,
      courses: current.courses.map((course) => {
        if (course.id !== courseId)
          return course

        return {
          ...course,
          chapters: course.chapters.map((chapter) => {
            if (chapter.id !== chapterId)
              return chapter

            return {
              ...chapter,
              sections: [
                ...chapter.sections,
                {
                  id: Date.now(),
                  chapterId,
                  name: values.name ?? '新小节',
                  order: values.order ?? chapter.sections.length + 1,
                  contentType: courseware?.type ?? values.contentType ?? 'video',
                  coursewareId: values.coursewareId ?? data.coursewares[0]?.id ?? 1,
                },
              ],
            }
          }),
        }
      }),
    }))
    message.success('小节已新增')
  }

  const addTask = (values: Partial<Task>): void => {
    const taskId = Date.now()

    setData(current => ({
      ...current,
      tasks: [
        ...current.tasks,
        {
          id: taskId,
          name: values.name ?? '未命名任务',
          courseId: values.courseId ?? 1,
          startTime: String(values.startTime),
          endTime: String(values.endTime),
          status: 'not_started',
          createdBy: 1,
        },
      ],
    }))
    message.success('任务已创建，请在任务列表中批量指派学员')
  }

  const assignTask = (taskId: number, userIds: number[]): void => {
    const task = data.tasks.find(item => item.id === taskId)

    setData((current) => {
      const existingUserIds = new Set(current.taskAssignments.filter(assignment => assignment.taskId === taskId).map(assignment => assignment.userId))
      const nextUserIds = userIds.filter(userId => !existingUserIds.has(userId))

      return {
        ...current,
        notifications: [
          ...current.notifications,
          ...nextUserIds.map<Notification>(userId => ({
            id: taskId + userId + Date.now(),
            userId,
            type: 'course_task',
            title: '新的课程任务',
            content: task?.name ?? '你有新的课程任务',
            isRead: false,
            sendTime: new Date().toISOString(),
          })),
        ],
        taskAssignments: [
          ...current.taskAssignments,
          ...nextUserIds.map<TaskAssignment>(userId => ({
            id: taskId + userId + Date.now(),
            taskId,
            userId,
          })),
        ],
      }
    })
    message.success(`已指派 ${userIds.length} 名学员`)
  }

  const addCoursewareCategory = (values: Partial<CoursewareCategory>): void => {
    setData(current => ({
      ...current,
      coursewareCategories: [...current.coursewareCategories, { id: Date.now(), name: values.name ?? '新课件分类', parentId: values.parentId, order: current.coursewareCategories.length + 1 }],
    }))
    message.success('课件分类已新增')
  }

  const addCourseCategory = (values: Partial<CourseCategory>): void => {
    setData(current => ({
      ...current,
      courseCategories: [...current.courseCategories, { id: Date.now(), name: values.name ?? '新课程分类', parentId: values.parentId, order: current.courseCategories.length + 1 }],
    }))
    message.success('课程分类已新增')
  }

  const addBinding = (values: Partial<CoursePositionBinding>): void => {
    setData(current => ({
      ...current,
      coursePositionBindings: [...current.coursePositionBindings, { id: Date.now(), courseId: values.courseId ?? 1, positionId: values.positionId ?? 1 }],
    }))
    message.success('岗位课程绑定已新增')
  }

  const addQuestion = (values: Partial<Question>): void => {
    setData(current => ({
      ...current,
      questions: [...current.questions, {
        id: Date.now(),
        content: values.content ?? '新试题',
        type: values.type ?? 'single',
        options: [{ label: '选项 A', value: 'A' }, { label: '选项 B', value: 'B' }],
        answer: values.type === 'judge' ? true : 'A',
        analysis: values.analysis ?? '暂无解析',
        difficulty: values.difficulty ?? 'easy',
        categoryId: 1,
        status: 'enabled',
      }],
    }))
    message.success('试题已新增')
  }

  const addPaper = (values: Partial<Paper> & { questionIds?: number[] }): void => {
    setData(current => ({
      ...current,
      papers: [...current.papers, {
        id: Date.now(),
        name: values.name ?? '新试卷',
        totalScore: values.totalScore ?? 100,
        questionCount: values.questionIds?.length ?? 0,
        questionIds: values.questionIds ?? [],
        status: 'draft',
      }],
    }))
    message.success('试卷已新增')
  }

  const addExam = (values: Partial<Exam>): void => {
    setData(current => ({
      ...current,
      exams: [...current.exams, {
        id: Date.now(),
        name: values.name ?? '新考试',
        paperId: values.paperId ?? 1,
        passScore: values.passScore ?? 60,
        duration: values.duration ?? 45,
        limitCount: values.limitCount ?? 3,
        status: 'draft',
      }],
    }))
    message.success('考试已新增')
  }

  const addOrganization = (values: Partial<Organization>): void => {
    setData(current => ({
      ...current,
      organizations: [...current.organizations, {
        id: Date.now(),
        name: values.name ?? '新组织',
        code: values.code ?? `ORG-${Date.now()}`,
        type: values.type ?? 'store',
        parentId: values.parentId,
      }],
    }))
    message.success('组织已新增')
  }

  const addPosition = (values: Partial<Position>): void => {
    setData(current => ({
      ...current,
      positions: [...current.positions, {
        id: Date.now(),
        name: values.name ?? `${values.positionType ?? '岗位'}-${values.level ?? 'L1'}`,
        code: values.code ?? `POS-${Date.now()}`,
        positionType: values.positionType ?? '销售',
        level: values.level ?? 'L1',
      }],
    }))
    message.success('岗位已新增')
  }

  const addEmployee = (values: Partial<Employee>): void => {
    const id = Date.now()
    setData(current => ({
      ...current,
      employees: [...current.employees, {
        id,
        name: values.name ?? '新员工',
        employeeNo: values.employeeNo ?? `E-${id}`,
        phone: values.phone ?? '13800000000',
        organizationId: values.organizationId ?? current.organizations[0]?.id ?? 1,
        status: 'active',
      }],
    }))
    message.success('员工已新增')
  }

  const addUser = (values: Partial<User>): void => {
    const employee = data.employees.find(item => item.id === values.employeeId)
    setData(current => ({
      ...current,
      users: [...current.users, {
        id: Date.now(),
        name: employee?.name ?? values.name ?? '新用户',
        employeeId: values.employeeId ?? current.employees[0]?.id ?? 1,
        userType: values.userType ?? 'student',
        status: 'active',
      }],
    }))
    message.success('用户已新增')
  }

  return (
    <ProLayout
      title="LMS 培训系统"
      logo={false}
      route={routes}
      location={{ pathname }}
      layout="mix"
      token={{
        header: {
          colorBgHeader: 'rgba(255, 255, 255, 0.7)',
          colorHeaderTitle: '#1e293b',
          colorTextMenu: '#64748b',
          colorTextMenuSelected: '#5C6BFF',
          colorBgMenuItemSelected: 'rgba(92, 107, 255, 0.08)',
          colorTextRightActionsItem: '#64748b',
        },
        sider: {
          colorMenuBackground: 'rgba(255, 255, 255, 0.6)',
          colorTextMenuSelected: '#5C6BFF',
          colorBgMenuItemSelected: 'linear-gradient(90deg, rgba(92,107,255,0.1) 0%, rgba(92,107,255,0) 100%)',
        },
        pageContainer: {
          colorBgPageContainer: 'transparent',
        },
      }}
      menuItemRender={(item, dom) => (
        <button id={`admin-nav-${item.path?.replaceAll('/', '-')}`} className="nav-button" onClick={() => item.path && setPathname(item.path)}>
          {dom}
        </button>
      )}
    >
      <PageContainer title={pageTitle(page)}>
        {page === 'dashboard' && <Dashboard activeCourses={activeCourses} activeTasks={activeTasks} data={data} />}
        {page === 'coursewares' && <CoursewareTable coursewares={data.coursewares} categories={data.coursewareCategories} onAdd={addCourseware} />}
        {page === 'coursewareCategories' && <CategoryTree title="课件分类" items={data.coursewareCategories} onAdd={addCoursewareCategory} />}
        {page === 'courseCategories' && <CourseCategoryTable categories={data.courseCategories} onAdd={addCourseCategory} />}
        {page === 'courses' && <CourseTable courses={data.courses} exams={data.exams} onAdd={addCourse} onPublish={publishCourse} />}
        {page === 'courseDetail' && <CourseDetail course={data.courses[0]!} coursewares={data.coursewares} onAddChapter={addChapter} onAddSection={addSection} />}
        {page === 'bindings' && <BindingTable data={data} onAdd={addBinding} />}
        {page === 'questions' && <QuestionTable questions={data.questions} onAdd={addQuestion} />}
        {page === 'papers' && <PaperTable papers={data.papers} questions={data.questions} onAdd={addPaper} />}
        {page === 'exams' && <ExamTable exams={data.exams} papers={data.papers} onAdd={addExam} />}
        {page === 'tasks' && <TaskTable tasks={data.tasks} courses={data.courses} users={data.users} assignments={data.taskAssignments} onAdd={addTask} onAssign={assignTask} />}
        {page === 'organizations' && <OrganizationTable organizations={data.organizations} onAdd={addOrganization} />}
        {page === 'positions' && <PositionTable positions={data.positions} onAdd={addPosition} />}
        {page === 'employees' && <EmployeeTable employees={data.employees} organizations={data.organizations} onAdd={addEmployee} />}
        {page === 'users' && <UserTable users={data.users} employees={data.employees} onAdd={addUser} />}
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
    employees: '员工管理',
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

function CoursewareTable({ coursewares, categories, onAdd }: { coursewares: Courseware[], categories: CoursewareCategory[], onAdd: (values: Partial<Courseware>) => void }): React.ReactElement {
  const [coverUrl, setCoverUrl] = useState('')

  const finishCreate = async (values: Partial<Courseware>): Promise<boolean> => {
    onAdd({ ...values, cover: coverUrl })
    setCoverUrl('')
    return true
  }

  const columns: ProColumns<Courseware>[] = [
    {
      title: '封面图',
      dataIndex: 'cover',
      search: false,
      render: (_, record) => record.cover
        ? <Image width={56} height={36} src={record.cover} preview={false} className="courseware-cover" />
        : <div className="courseware-cover-placeholder">无封面</div>,
    },
    { title: '课件名称', dataIndex: 'name' },
    { title: '编码', dataIndex: 'code' },
    { title: '类型', dataIndex: 'type', valueEnum: { 'video': '视频', 'article': '图文', 'document': '文档', '3d': '3D' } },
    { title: '课件地址', dataIndex: 'url', ellipsis: true, copyable: true },
    { title: '时长', dataIndex: 'duration', renderText: value => `${value} 分钟` },
    { title: '必修', dataIndex: 'isRequired', render: (_, record) => <Tag color={record.isRequired ? 'red' : 'default'}>{record.isRequired ? '必修' : '选修'}</Tag> },
    { title: '课件分类', dataIndex: 'categoryId', renderText: value => categories.find(category => category.id === value)?.name ?? '-' },
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
          <ProFormText name="url" label="课件地址" rules={[{ required: true }]} />
          <div className="courseware-cover-upload-field">
            <span className="courseware-cover-upload-label">封面图</span>
            <Upload
              id="admin-courseware-cover-upload"
              accept="image/*"
              listType="picture-card"
              maxCount={1}
              beforeUpload={(file) => {
                setCoverUrl(URL.createObjectURL(file))
                return false
              }}
              onRemove={() => {
                setCoverUrl('')
              }}
            >
              {coverUrl ? null : '上传封面'}
            </Upload>
          </div>
          <ProFormDigit name="duration" label="学习时长（分钟）" initialValue={10} />
          <ProFormSelect name="categoryId" label="课件分类" initialValue={categories[0]?.id} options={categories.map(category => ({ label: category.name, value: category.id }))} />
          <ProFormSelect name="isRequired" label="是否必修" initialValue options={[{ label: '必修', value: true }, { label: '选修', value: false }]} />
          <Upload.Dragger id="admin-courseware-upload" beforeUpload={() => false}>拖拽或点击上传课件文件</Upload.Dragger>
        </ModalForm>,
      ]}
    />
  )
}

function CategoryTree({ title, items, onAdd }: { title: string, items: Array<{ id: number, name: string, parentId?: number }>, onAdd: (values: { name?: string, parentId?: number }) => void }): React.ReactElement {
  const finishCreate = async (values: { name?: string, parentId?: number }): Promise<boolean> => {
    onAdd(values)
    return true
  }

  const treeData = items.map(item => ({ key: item.id, title: item.name }))
  return (
    <Card
      title={title}
      extra={(
        <ModalForm key="add" title={`新增${title}`} trigger={<Button id={`admin-${title}-create-button`} type="primary" icon={<PlusOutlined />}>新增分类</Button>} onFinish={finishCreate}>
          <ProFormText name="name" label="分类名称" rules={[{ required: true }]} />
          <ProFormSelect name="parentId" label="上级分类" options={items.map(item => ({ label: item.name, value: item.id }))} />
        </ModalForm>
      )}
    >
      <div id={`admin-${title}-tree`}><Tree defaultExpandAll treeData={treeData} /></div>
    </Card>
  )
}

function CourseCategoryTable({ categories, onAdd }: { categories: CourseCategory[], onAdd: (values: Partial<CourseCategory>) => void }): React.ReactElement {
  const finishCreate = async (values: Partial<CourseCategory>): Promise<boolean> => {
    onAdd(values)
    return true
  }

  return (
    <ProTable<CourseCategory>
      rowKey="id"
      search={false}
      dataSource={categories}
      columns={[
        { title: '分类名称', dataIndex: 'name' },
        { title: '上级分类', dataIndex: 'parentId', renderText: value => categories.find(category => category.id === value)?.name ?? '-' },
        { title: '排序', dataIndex: 'order' },
      ]}
      toolBarRender={() => [
        <ModalForm key="add" title="新增课程分类" trigger={<Button id="admin-course-category-create-button" type="primary" icon={<PlusOutlined />}>新增分类</Button>} onFinish={finishCreate}>
          <ProFormText name="name" label="分类名称" rules={[{ required: true }]} />
          <ProFormSelect name="parentId" label="上级分类" options={categories.map(category => ({ label: category.name, value: category.id }))} />
        </ModalForm>,
      ]}
    />
  )
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

function CourseDetail({ course, coursewares, onAddChapter, onAddSection }: { course: Course, coursewares: Courseware[], onAddChapter: (courseId: number, values: Partial<Chapter>) => void, onAddSection: (courseId: number, chapterId: number, values: Partial<Section>) => void }): React.ReactElement {
  const finishCreateChapter = async (values: Partial<Chapter>): Promise<boolean> => {
    onAddChapter(course.id, values)
    return true
  }

  const finishCreateSection = async (chapterId: number, values: Partial<Section>): Promise<boolean> => {
    onAddSection(course.id, chapterId, values)
    return true
  }

  return (
    <Space direction="vertical" className="full-width" size={16}>
      <ProDescriptions title={course.name} dataSource={course} columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'description' }, { title: '状态', dataIndex: 'status', render: (_, record) => publishTag(record.status) }]} />
      <Card
        title="章节与小节"
        extra={(
          <ModalForm key="add" title="新增章节" trigger={<Button id="admin-chapter-create-button" type="primary" icon={<PlusOutlined />}>新增章节</Button>} onFinish={finishCreateChapter}>
            <ProFormText name="name" label="章节名称" rules={[{ required: true }]} />
            <ProFormDigit name="order" label="排序" initialValue={course.chapters.length + 1} min={1} />
            <ProFormSelect name="isExamRequired" label="是否需要章节考试" initialValue={false} options={[{ label: '不需要', value: false }, { label: '需要', value: true }]} />
          </ModalForm>
        )}
      >
        <Tabs
          items={course.chapters.map(chapter => ({
            key: String(chapter.id),
            label: `${chapter.order}. ${chapter.name}`,
            children: (
              <ProTable<Section>
                rowKey="id"
                search={false}
                pagination={false}
                dataSource={chapter.sections}
                columns={[
                  { title: '小节名称', dataIndex: 'name' },
                  { title: '内容类型', dataIndex: 'contentType', valueEnum: { 'video': '视频', 'article': '图文', 'document': '文档', '3d': '3D' } },
                  { title: '引用课件', dataIndex: 'coursewareId', renderText: value => coursewares.find(courseware => courseware.id === value)?.name ?? '-' },
                  { title: '排序', dataIndex: 'order' },
                ]}
                toolBarRender={() => [
                  <ModalForm key="add" title={`新增小节：${chapter.name}`} trigger={<Button id={`admin-section-create-${chapter.id}`} type="primary" icon={<PlusOutlined />}>新增小节</Button>} onFinish={values => finishCreateSection(chapter.id, values)}>
                    <ProFormText name="name" label="小节名称" rules={[{ required: true }]} />
                    <ProFormSelect name="coursewareId" label="引用课件" rules={[{ required: true }]} options={coursewares.map(courseware => ({ label: `${courseware.name}（${courseware.type}）`, value: courseware.id }))} />
                    <ProFormDigit name="order" label="排序" initialValue={chapter.sections.length + 1} min={1} />
                  </ModalForm>,
                ]}
              />
            ),
          }))}
        />
      </Card>
    </Space>
  )
}

function BindingTable({ data, onAdd }: { data: typeof initialData, onAdd: (values: Partial<CoursePositionBinding>) => void }): React.ReactElement {
  const finishCreate = async (values: Partial<CoursePositionBinding>): Promise<boolean> => {
    onAdd(values)
    return true
  }

  const rows = data.coursePositionBindings.map(binding => ({
    ...binding,
    courseName: data.courses.find(course => course.id === binding.courseId)?.name,
    positionName: data.positions.find(position => position.id === binding.positionId)?.name,
  }))
  return (
    <ProTable
      rowKey="id"
      search={false}
      dataSource={rows}
      columns={[{ title: '课程', dataIndex: 'courseName' }, { title: '岗位等级', dataIndex: 'positionName' }]}
      toolBarRender={() => [
        <ModalForm key="add" title="新增岗位课程绑定" trigger={<Button id="admin-binding-create-button" type="primary" icon={<PlusOutlined />}>新增绑定</Button>} onFinish={finishCreate}>
          <ProFormSelect name="courseId" label="课程" rules={[{ required: true }]} options={data.courses.map(course => ({ label: course.name, value: course.id }))} />
          <ProFormSelect name="positionId" label="岗位等级" rules={[{ required: true }]} options={data.positions.map(position => ({ label: position.name, value: position.id }))} />
        </ModalForm>,
      ]}
    />
  )
}

function QuestionTable({ questions, onAdd }: { questions: Question[], onAdd: (values: Partial<Question>) => void }): React.ReactElement {
  const finishCreate = async (values: Partial<Question>): Promise<boolean> => {
    onAdd(values)
    return true
  }

  return (
    <ProTable<Question>
      rowKey="id"
      search={false}
      dataSource={questions}
      columns={[{ title: '题目', dataIndex: 'content' }, { title: '题型', dataIndex: 'type' }, { title: '难度', dataIndex: 'difficulty' }, { title: '状态', dataIndex: 'status', render: (_, record) => <Tag color={record.status === 'enabled' ? 'green' : 'default'}>{record.status === 'enabled' ? '启用' : '禁用'}</Tag> }]}
      toolBarRender={() => [
        <ModalForm key="add" title="新增试题" trigger={<Button id="admin-question-create-button" type="primary" icon={<PlusOutlined />}>新增试题</Button>} onFinish={finishCreate}>
          <ProFormText name="content" label="题干" rules={[{ required: true }]} />
          <ProFormSelect name="type" label="题型" initialValue="single" options={[{ label: '单选', value: 'single' }, { label: '多选', value: 'multiple' }, { label: '判断', value: 'judge' }]} />
          <ProFormSelect name="difficulty" label="难度" initialValue="easy" options={[{ label: '简单', value: 'easy' }, { label: '中等', value: 'medium' }, { label: '困难', value: 'hard' }]} />
          <ProFormText name="analysis" label="解析" />
        </ModalForm>,
      ]}
    />
  )
}

function PaperTable({ papers, questions, onAdd }: { papers: Paper[], questions: Question[], onAdd: (values: Partial<Paper> & { questionIds?: number[] }) => void }): React.ReactElement {
  const finishCreate = async (values: Partial<Paper> & { questionIds?: number[] }): Promise<boolean> => {
    onAdd(values)
    return true
  }

  return (
    <ProTable<Paper>
      rowKey="id"
      search={false}
      dataSource={papers}
      columns={[{ title: '试卷名称', dataIndex: 'name' }, { title: '总分', dataIndex: 'totalScore' }, { title: '题量', dataIndex: 'questionCount' }, { title: '状态', dataIndex: 'status', render: (_, record) => publishTag(record.status) }]}
      toolBarRender={() => [
        <ModalForm key="add" title="新增试卷" trigger={<Button id="admin-paper-create-button" type="primary" icon={<PlusOutlined />}>新增试卷</Button>} onFinish={finishCreate}>
          <ProFormText name="name" label="试卷名称" rules={[{ required: true }]} />
          <ProFormDigit name="totalScore" label="总分" initialValue={100} />
          <ProFormSelect name="questionIds" label="选择试题" mode="multiple" options={questions.map(question => ({ label: question.content, value: question.id }))} />
        </ModalForm>,
      ]}
    />
  )
}

function ExamTable({ exams, papers, onAdd }: { exams: Exam[], papers: Paper[], onAdd: (values: Partial<Exam>) => void }): React.ReactElement {
  const finishCreate = async (values: Partial<Exam>): Promise<boolean> => {
    onAdd(values)
    return true
  }

  return (
    <ProTable<Exam>
      rowKey="id"
      search={false}
      dataSource={exams}
      columns={[{ title: '考试名称', dataIndex: 'name' }, { title: '合格分', dataIndex: 'passScore' }, { title: '时长', dataIndex: 'duration', renderText: value => `${value} 分钟` }, { title: '限考次数', dataIndex: 'limitCount' }, { title: '状态', dataIndex: 'status', render: (_, record) => publishTag(record.status) }]}
      toolBarRender={() => [
        <ModalForm key="add" title="新增考试" trigger={<Button id="admin-exam-create-button" type="primary" icon={<PlusOutlined />}>新增考试</Button>} onFinish={finishCreate}>
          <ProFormText name="name" label="考试名称" rules={[{ required: true }]} />
          <ProFormSelect name="paperId" label="关联试卷" rules={[{ required: true }]} options={papers.map(paper => ({ label: paper.name, value: paper.id }))} />
          <ProFormDigit name="passScore" label="合格分" initialValue={60} />
          <ProFormDigit name="duration" label="考试时长（分钟）" initialValue={45} />
          <ProFormDigit name="limitCount" label="限考次数" initialValue={3} />
        </ModalForm>,
      ]}
    />
  )
}

function TaskTable({ tasks, courses, users, assignments, onAdd, onAssign }: { tasks: Task[], courses: Course[], users: User[], assignments: TaskAssignment[], onAdd: (values: Partial<Task>) => void, onAssign: (taskId: number, userIds: number[]) => void }): React.ReactElement {
  const finishCreate = async (values: Partial<Task>): Promise<boolean> => {
    onAdd(values)
    return true
  }

  const finishAssign = async (taskId: number, values: { userIds?: number[] }): Promise<boolean> => {
    onAssign(taskId, values.userIds ?? [])
    return true
  }

  const students = users.filter(user => user.userType === 'student')
  const rows = useMemo(() => tasks.map(task => ({
    ...task,
    assignedCount: assignments.filter(assignment => assignment.taskId === task.id).length,
    computedStatus: getTaskStatus(new Date(), task),
    courseName: courses.find(course => course.id === task.courseId)?.name,
  })), [assignments, courses, tasks])
  return (
    <ProTable
      rowKey="id"
      search={false}
      dataSource={rows}
      columns={[
        { title: '任务名称', dataIndex: 'name' },
        { title: '课程', dataIndex: 'courseName' },
        { title: '已指派', dataIndex: 'assignedCount', renderText: value => `${value} 人` },
        { title: '开始时间', dataIndex: 'startTime' },
        { title: '截止时间', dataIndex: 'endTime' },
        { title: '状态', dataIndex: 'computedStatus', render: (_, record) => <Tag>{statusText[record.computedStatus as keyof typeof statusText]}</Tag> },
        {
          title: '操作',
          valueType: 'option',
          render: (_, record) => [
            <ModalForm
              key="assign"
              title={`批量指派：${record.name}`}
              trigger={<Button id={`admin-task-assign-${record.id}`} type="link">批量指派</Button>}
              onFinish={values => finishAssign(record.id, values)}
            >
              <ProFormSelect
                name="userIds"
                label="指派学员"
                mode="multiple"
                rules={[{ required: true, message: '请选择至少一名学员' }]}
                options={students.map(user => ({ label: user.name, value: user.id, disabled: assignments.some(assignment => assignment.taskId === record.id && assignment.userId === user.id) }))}
              />
            </ModalForm>,
          ],
        },
      ]}
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

function OrganizationTable({ organizations, onAdd }: { organizations: Organization[], onAdd: (values: Partial<Organization>) => void }): React.ReactElement {
  const finishCreate = async (values: Partial<Organization>): Promise<boolean> => {
    onAdd(values)
    return true
  }

  return (
    <ProTable<Organization>
      headerTitle="组织架构"
      rowKey="id"
      search={false}
      dataSource={organizations}
      columns={[{ title: '组织名称', dataIndex: 'name' }, { title: '编码', dataIndex: 'code' }, { title: '类型', dataIndex: 'type', renderText: value => value === 'factory' ? '厂端' : '门店' }, { title: '上级组织', dataIndex: 'parentId', renderText: value => organizations.find(item => item.id === value)?.name ?? '-' }]}
      toolBarRender={() => [
        <ModalForm key="add" title="新增组织" trigger={<Button id="admin-organization-create-button" type="primary" icon={<PlusOutlined />}>新增组织</Button>} onFinish={finishCreate}>
          <ProFormText name="name" label="组织名称" rules={[{ required: true }]} />
          <ProFormText name="code" label="组织编码" rules={[{ required: true }]} />
          <ProFormSelect name="type" label="组织类型" initialValue="store" options={[{ label: '厂端', value: 'factory' }, { label: '门店', value: 'store' }]} />
          <ProFormSelect name="parentId" label="上级组织" options={organizations.map(item => ({ label: item.name, value: item.id }))} />
        </ModalForm>,
      ]}
    />
  )
}

function PositionTable({ positions, onAdd }: { positions: Position[], onAdd: (values: Partial<Position>) => void }): React.ReactElement {
  const finishCreate = async (values: Partial<Position>): Promise<boolean> => {
    onAdd(values)
    return true
  }

  return (
    <ProTable<Position>
      headerTitle="岗位管理"
      rowKey="id"
      search={false}
      dataSource={positions}
      columns={[{ title: '岗位名称', dataIndex: 'name' }, { title: '编码', dataIndex: 'code' }, { title: '岗位类型', dataIndex: 'positionType' }, { title: '等级', dataIndex: 'level' }]}
      toolBarRender={() => [
        <ModalForm key="add" title="新增岗位" trigger={<Button id="admin-position-create-button" type="primary" icon={<PlusOutlined />}>新增岗位</Button>} onFinish={finishCreate}>
          <ProFormText name="name" label="岗位名称" rules={[{ required: true }]} />
          <ProFormText name="code" label="岗位编码" rules={[{ required: true }]} />
          <ProFormText name="positionType" label="岗位类型" rules={[{ required: true }]} />
          <ProFormSelect name="level" label="等级" initialValue="L1" options={[{ label: 'L1', value: 'L1' }, { label: 'L2', value: 'L2' }, { label: 'L3', value: 'L3' }]} />
        </ModalForm>,
      ]}
    />
  )
}

function EmployeeTable({ employees, organizations, onAdd }: { employees: Employee[], organizations: Organization[], onAdd: (values: Partial<Employee>) => void }): React.ReactElement {
  const finishCreate = async (values: Partial<Employee>): Promise<boolean> => {
    onAdd(values)
    return true
  }

  return (
    <ProTable<Employee>
      headerTitle="员工管理"
      rowKey="id"
      search={false}
      dataSource={employees}
      columns={[
        { title: '姓名', dataIndex: 'name' },
        { title: '工号', dataIndex: 'employeeNo' },
        { title: '手机号', dataIndex: 'phone' },
        { title: '所属组织', dataIndex: 'organizationId', renderText: value => organizations.find(organization => organization.id === value)?.name ?? '-' },
        { title: '状态', dataIndex: 'status', renderText: value => value === 'active' ? '在职' : '离职' },
      ]}
      toolBarRender={() => [
        <ModalForm key="add" title="新增员工" trigger={<Button id="admin-employee-create-button" type="primary" icon={<PlusOutlined />}>新增员工</Button>} onFinish={finishCreate}>
          <ProFormText name="name" label="姓名" rules={[{ required: true }]} />
          <ProFormText name="employeeNo" label="工号" rules={[{ required: true }]} />
          <ProFormText name="phone" label="手机号" rules={[{ required: true }]} />
          <ProFormSelect name="organizationId" label="所属组织" rules={[{ required: true }]} options={organizations.map(organization => ({ label: organization.name, value: organization.id }))} />
        </ModalForm>,
      ]}
    />
  )
}

function UserTable({ users, employees, onAdd }: { users: User[], employees: Employee[], onAdd: (values: Partial<User>) => void }): React.ReactElement {
  const finishCreate = async (values: Partial<User>): Promise<boolean> => {
    onAdd(values)
    return true
  }

  const usedEmployeeIds = new Set(users.map(user => user.employeeId))

  return (
    <ProTable<User>
      headerTitle="用户管理"
      rowKey="id"
      search={false}
      dataSource={users}
      columns={[
        { title: '姓名', dataIndex: 'name' },
        { title: '关联员工', dataIndex: 'employeeId', renderText: value => employees.find(employee => employee.id === value)?.employeeNo ?? '-' },
        { title: '用户类型', dataIndex: 'userType', renderText: value => value === 'admin' ? '厂端管理员' : '学员' },
        { title: '状态', dataIndex: 'status', renderText: value => value === 'active' ? '在职' : '离职' },
      ]}
      toolBarRender={() => [
        <ModalForm key="add" title="新增用户" trigger={<Button id="admin-user-create-button" type="primary" icon={<PlusOutlined />}>新增用户</Button>} onFinish={finishCreate}>
          <ProFormSelect name="employeeId" label="关联员工" rules={[{ required: true }]} options={employees.map(employee => ({ label: `${employee.name}（${employee.employeeNo}）`, value: employee.id, disabled: usedEmployeeIds.has(employee.id) }))} />
          <ProFormSelect name="userType" label="用户类型" initialValue="student" options={[{ label: '厂端管理员', value: 'admin' }, { label: '学员', value: 'student' }]} />
        </ModalForm>,
      ]}
    />
  )
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
