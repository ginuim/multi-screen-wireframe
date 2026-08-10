import { CollectionScreen } from './screens/collection.jsx'
import { EnvironmentsScreen } from './screens/environments.jsx'
import { HistoryScreen } from './screens/history.jsx'
import { RequestEditorScreen } from './screens/request-editor.jsx'
import { SettingsScreen } from './screens/settings.jsx'
import { WorkspaceScreen } from './screens/workspace.jsx'

const SHELL_LINKS = ['workspace', 'collection', 'environments', 'history', 'settings']

export const project = {
  name: 'API Client（Postman 风格）',
  viewports: {
    desktop: { width: 1440, height: 900 },
  },
  defaultViewport: 'desktop',
  screens: [
    {
      id: 'workspace',
      title: '工作区',
      description: 'Collections 侧栏与最近请求入口',
      component: WorkspaceScreen,
      entry: true,
      links: [...SHELL_LINKS, 'request-editor'],
      edgeCases: [],
    },
    {
      id: 'collection',
      title: 'Collection',
      description: '文件夹与请求树，打开请求编辑器',
      component: CollectionScreen,
      links: [...SHELL_LINKS, 'request-editor'],
      edgeCases: [],
    },
    {
      id: 'request-editor',
      title: '请求编辑',
      description: 'Method / URL / Params / Headers / Body 与 Response',
      component: RequestEditorScreen,
      links: SHELL_LINKS,
      edgeCases: [],
    },
    {
      id: 'environments',
      title: '环境变量',
      description: '多环境切换与变量表',
      component: EnvironmentsScreen,
      links: SHELL_LINKS,
      edgeCases: [],
    },
    {
      id: 'history',
      title: '历史记录',
      description: '最近发送记录，可重新打开编辑器',
      component: HistoryScreen,
      links: [...SHELL_LINKS, 'request-editor'],
      edgeCases: [],
    },
    {
      id: 'settings',
      title: '设置',
      description: '通用、代理与证书',
      component: SettingsScreen,
      links: SHELL_LINKS,
      edgeCases: [],
    },
  ],
}
